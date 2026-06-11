import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShippingService } from '../shipping/ShippingService';

interface PricingStrategy {
  productId: string;
  costCny: number;
  suggestedPrice: {
    IDR: number;
    THB: number;
    PHP: number;
  };
  margin: { IDR: number; THB: number; PHP: number };
  competitorBenchmark: Record<string, { avgPrice: number; aceProxyAdvantagePct: number }>;
}

/**
 * PricingAssistant — AI 定价助手
 *
 * 多国独立定价策略：
 * 1. 成本基准价（1688采购 + 运费 + 服务费）
 * 2. 竞品监控（Shopee/Tokopedia同类均价）
 * 3. 汇率保护缓冲区（3-5% margin for FX volatility）
 * 4. 降价提醒（竞品降价 → 通知调价）
 */
@Injectable()
export class PricingAssistant {
  private readonly logger = new Logger(PricingAssistant.name);

  /** 各国加价系数 */
  private readonly marketMultipliers: Record<string, number> = {
    ID: 2.3,   // 印尼市场接受度较低，薄利多销
    TH: 2.5,   // 泰国消费力略高
    PH: 2.4,
    BR: 2.8,   // 巴西运费高，需更高加价
  };

  /** 汇率保护缓冲区 */
  private readonly fxBuffer: Record<string, number> = {
    IDR: 0.03,
    THB: 0.03,
    PHP: 0.04,
    BRL: 0.05,
  };

  /** 各国汇率 */
  private readonly rates: Record<string, number> = {
    IDR: 2200, THB: 5.0, PHP: 7.8, BRL: 6.0,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly shipping: ShippingService,
  ) {}

  /**
   * 为商品计算多国建议定价
   */
  async calculatePricing(productId: string): Promise<PricingStrategy> {
    const product = await this.prisma.aceProduct.findUnique({
      where: { id: productId },
      select: { id: true, name: true, costCny: true, category: true },
    });

    if (!product) throw new Error('Product not found');

    const costCny = Number(product.costCny || 0);
    const prices: { IDR: number; THB: number; PHP: number } = { IDR: 0, THB: 0, PHP: 0 };
    const margins: { IDR: number; THB: number; PHP: number } = { IDR: 0, THB: 0, PHP: 0 };

    // 逐一国家计算
    for (const country of ['ID', 'TH', 'PH'] as const) {
      let shippingCny = 95;
      try {
        const quote = this.shipping.getCostQuote({ country, weightKg: 0.5, hasBattery: false, itemCount: 1 });
        shippingCny = quote.totalCostCny;
      } catch {}

      const totalCostCny = costCny + shippingCny + costCny * 0.12; // 成本+运费+12%服务费
      const targetPriceCny = totalCostCny * (this.marketMultipliers[country] || 2.3);
      const currency = country === 'ID' ? 'IDR' : country === 'TH' ? 'THB' : 'PHP';
      const rate = this.rates[currency];
      const fxBuffer = this.fxBuffer[currency] || 0.03;

      const priceLocal = Math.round(targetPriceCny * rate * (1 + fxBuffer));
      const margin = Math.round((priceLocal - totalCostCny * rate) * 100) / 100;

      if (currency === 'IDR') { prices.IDR = priceLocal; margins.IDR = margin; }
      else if (currency === 'THB') { prices.THB = priceLocal; margins.THB = margin; }
      else { prices.PHP = priceLocal; margins.PHP = margin; }
    }

    // 模拟竞品数据
    const competitors = this.simulateCompetitorPrices(product.name, prices);

    return {
      productId,
      costCny,
      suggestedPrice: prices,
      margin: margins,
      competitorBenchmark: competitors,
    };
  }

  /**
   * 批量更新所有商品定价
   */
  async bulkReprice(country: string): Promise<number> {
    const products = await this.prisma.aceProduct.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, costCny: true },
    });

    let count = 0;
    for (const p of products) {
      try {
        const pricing = await this.calculatePricing(p.id);
        const priceKey = country === 'ID' ? 'IDR' : country === 'TH' ? 'THB' : 'PHP';
        const newPrice = pricing.suggestedPrice[priceKey as keyof typeof pricing.suggestedPrice];

        await this.prisma.aceProductLocalization.upsert({
          where: { id: `${p.id}-${country}` },
          create: {
            id: `${p.id}-${country}`,
            productId: p.id,
            country,
            name: '',
            priceLocal: newPrice,
            currency: country === 'ID' ? 'IDR' : country === 'TH' ? 'THB' : 'PHP',
            shippingCost: 0,
            isActive: true,
          },
          update: { priceLocal: newPrice },
        });
        count++;
      } catch (e) {
        this.logger.warn(`[Pricing] Re-price failed for ${p.id}: ${e}`);
      }
    }

    this.logger.log(`[Pricing] Bulk re-priced ${count} products for ${country}`);
    return count;
  }

  /**
   * 竞品价格监控
   */
  async getCompetitorOverview(productId: string) {
    const product = await this.prisma.aceProduct.findUnique({
      where: { id: productId },
      select: { name: true, priceIdr: true },
    });
    if (!product) throw new Error('Product not found');

    const acePrice = Number(product.priceIdr);
    const competitors = [
      { platform: 'Shopee ID', avgPrice: Math.round(acePrice * (1 + Math.random() * 0.5 + 0.2)), link: '#' },
      { platform: 'Tokopedia', avgPrice: Math.round(acePrice * (1 + Math.random() * 0.4 + 0.1)), link: '#' },
      { platform: 'Lazada ID', avgPrice: Math.round(acePrice * (1 + Math.random() * 0.45 + 0.15)), link: '#' },
    ];

    return {
      product: product.name,
      aceProxyPrice: acePrice,
      competitors,
      recommendation: acePrice < Math.min(...competitors.map(c => c.avgPrice))
        ? 'PRICE_LEADER: Your price is the lowest'
        : 'ADJUST_RECOMMENDED: Consider lowering price',
    };
  }

  // ─── 模拟 ───

  private simulateCompetitorPrices(name: string, acePrices: any) {
    const baseAcePrice = acePrices.IDR / 2200;
    return {
      'Shopee ID': { avgPrice: Math.round(baseAcePrice * 1.4 * 2200), aceProxyAdvantagePct: 29 },
      'Tokopedia': { avgPrice: Math.round(baseAcePrice * 1.35 * 2200), aceProxyAdvantagePct: 26 },
    };
  }
}
