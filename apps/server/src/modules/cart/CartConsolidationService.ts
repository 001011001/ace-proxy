import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShippingService } from '../shipping/ShippingService';

interface ConsolidationBatch {
  batchId: string;
  parcels: { itemId: string; productName: string; weightKg: number; status: string }[];
  totalWeightKg: number;
  currentShippingCny: number;
  nextTierSavings: { addKg: number; savePct: number; newRate: number } | null;
  suggestions: { productId: string; name: string; priceLocal: number; weightKg: number }[];
  daysUntilAutoShip: number;
  canShipNow: boolean;
}

/**
 * CartConsolidationService — 购物车集运批次分组 + AI凑单
 *
 * 将购物车按集运状态分组：
 * - 已入库（WAREHOUSE_RECEIVED/QC_PASSED）→ 可集运
 * - 待采购（PURCHASING/PURCHASED）→ 等待中
 * - 待入库（IN_TRANSIT_TO_WAREHOUSE）→ 在途
 *
 * 自动计算：凑满下一重量段需要加多少重量，推荐凑单品
 */
@Injectable()
export class CartConsolidationService {
  private readonly logger = new Logger(CartConsolidationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly shipping: ShippingService,
  ) {}

  /** 重量段阈值 */
  private readonly weightTiers = [
    { upTo: 0.5, rate: 'standard', description: '0–0.5kg' },
    { upTo: 1.0, rate: 'standard', description: '0.5–1kg' },
    { upTo: 3.0, rate: 'discount', discount: 0.08, description: '1–3kg (save 8%)' },
    { upTo: 5.0, rate: 'discount', discount: 0.12, description: '3–5kg (save 12%)' },
    { upTo: 10.0, rate: 'best', discount: 0.18, description: '5–10kg (save 18%)' },
  ];

  /**
   * 获取用户所有集运批次
   */
  async getUserBatches(userId: string, country: string): Promise<{
    ready: ConsolidationBatch;
    pending: { itemId: string; productName: string; status: string; weightKg: number }[];
    inTransit: { itemId: string; productName: string; weightKg: number }[];
  }> {
    // 查询用户的包裹（通过订单关联）
    const parcels = await this.prisma.aceParcel.findMany({
      where: { order: { userId } },
      include: {
        order: {
          include: {
            items: { include: { product: { select: { id: true, name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const ready: any[] = [];
    const pending: any[] = [];
    const inTransit: any[] = [];

    for (const p of parcels) {
      const item = {
        itemId: p.id,
        productName: p.order?.items[0]?.product?.name || 'Unknown',
        weightKg: p.weight || 0.5,
        status: p.status,
      };

      if (p.status === 'IN_WAREHOUSE' || p.qcStatus === 'PASSED') {
        ready.push(item);
      } else if (p.status === 'IN_TRANSIT_TO_WAREHOUSE') {
        inTransit.push(item);
      } else {
        pending.push(item);
      }
    }

    const totalWeight = ready.reduce((s, p) => s + p.weightKg, 0);
    const shippingQuote = await this.shipping.getUserQuote({
      country,
      weightKg: Math.max(totalWeight, 0.1),
      hasBattery: false,
      itemCount: ready.length || 1,
    });

    // 计算下一档
    const currentTier = this.findTier(totalWeight);
    const nextTier = this.weightTiers.find(t => t.upTo > totalWeight);
    const savings = nextTier?.discount
      ? { addKg: Math.round((nextTier.upTo - totalWeight) * 10) / 10, savePct: nextTier.discount * 100, newRate: shippingQuote.userPrice * (1 - nextTier.discount) }
      : null;

    // AI 凑单建议
    const suggestions = savings
      ? await this.suggestAddOns(country, savings.addKg, 3)
      : [];

    const batch: ConsolidationBatch = {
      batchId: `BATCH-${Date.now()}`,
      parcels: ready,
      totalWeightKg: totalWeight,
      currentShippingCny: shippingQuote.costCny,
      nextTierSavings: savings,
      suggestions,
      daysUntilAutoShip: Math.max(0, 14 - this.getDaysInWarehouse(parcels)),
      canShipNow: totalWeight >= 0.5,
    };

    return { ready: batch, pending, inTransit };
  }

  /**
   * 推荐凑单品
   */
  private async suggestAddOns(country: string, targetWeightKg: number, limit: number) {
    const products = await this.prisma.aceProduct.findMany({
      where: { status: 'ACTIVE' },
      take: limit,
      orderBy: { ratingCount: 'desc' },
      select: { id: true, name: true, priceIdr: true },
    });

    return products.map(p => ({
      productId: p.id,
      name: p.name,
      priceLocal: Number(p.priceIdr),
      weightKg: Math.round(targetWeightKg / limit * 10) / 10,
    }));
  }

  private findTier(weightKg: number) {
    return this.weightTiers.find(t => weightKg <= t.upTo) || this.weightTiers[this.weightTiers.length - 1];
  }

  private getDaysInWarehouse(parcels: any[]): number {
    if (!parcels.length) return 0;
    const oldest = Math.min(...parcels.map(p => new Date(p.warehouseEntryAt || p.createdAt).getTime()));
    return Math.floor((Date.now() - oldest) / (24 * 60 * 60 * 1000));
  }
}
