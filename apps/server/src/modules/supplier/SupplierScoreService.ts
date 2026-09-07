import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SupplierStats {
  supplierId: string;
  avgLeadTimeHrs: number;
  defectRate: number;
  resaleRejectionRate: number;
  totalOrders: number;
}

@Injectable()
export class SupplierScoreService {
  private readonly logger = new Logger(SupplierScoreService.name);

  // 阈值配置 (由 Ecommerce Mind 审计)
  private readonly RED_LINE_LT_HRS = 72;
  private readonly RED_LINE_DEFECT_RATE = 0.03;
  private readonly RED_LINE_REJECTION_RATE = 0.08;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取供应商列表（含评分）
   */
  async listSuppliers() {
    const suppliers = await this.prisma.aceSupplier.findMany({
      orderBy: { name: 'asc' },
    });
    return {
      suppliers: suppliers.map((s) => ({
        id: s.id,
        supplierId: s.id,
        name: s.name,
        source: '1688',
        avgLeadTimeHrs: s.avgLeadTime ? Number(s.avgLeadTime) : null,
        defectRate: s.defectRate ? Number(s.defectRate) : 0,
        resaleRejectionRate: s.resaleRejectionRate ? Number(s.resaleRejectionRate) : 0,
        score: this.calculateScore(
          s.avgLeadTime ? Number(s.avgLeadTime) : 72,
          s.defectRate ? Number(s.defectRate) : 0,
          s.resaleRejectionRate ? Number(s.resaleRejectionRate) : 0,
        ),
        status: s.status,
        isBlacklisted: s.status === 'BLACKLISTED',
      })),
    };
  }

  /**
   * 综合评分（满分 5.0）— 三维指标
   * 1. LTC 交付时效（avgLeadTimeHrs）
   * 2. QC Rate 质检缺陷率（defectRate）
   * 3. Resale Rate 转卖拒收率（resaleRejectionRate）
   */
  private calculateScore(
    avgLeadTimeHrs: number,
    defectRate: number,
    resaleRejectionRate: number,
  ): number {
    let score = 5.0;

    // ① LTC — 交付时效
    if (avgLeadTimeHrs > 48) score -= 0.5;
    if (avgLeadTimeHrs > 72) score -= 1.0;

    // ② QC Rate — 质检缺陷率
    if (defectRate > 0.02) score -= 0.5;
    if (defectRate > 0.05) score -= 1.0;

    // ③ Resale Rate — 转卖拒收率
    if (resaleRejectionRate > 0.05) score -= 0.5;
    if (resaleRejectionRate > 0.08) score -= 1.0;

    return Math.max(1.0, score);
  }

  /**
   * 评估供应商风险
   */
  async evaluateSupplier(stats: SupplierStats): Promise<{ isBlacklisted: boolean; reason?: string }> {
    if (stats.avgLeadTimeHrs > this.RED_LINE_LT_HRS) {
      return { isBlacklisted: true, reason: `Lead time ${stats.avgLeadTimeHrs}h exceeds 72h limit.` };
    }
    if (stats.defectRate > this.RED_LINE_DEFECT_RATE) {
      return { isBlacklisted: true, reason: `Defect rate ${stats.defectRate * 100}% exceeds 3% limit.` };
    }
    if (stats.resaleRejectionRate > this.RED_LINE_REJECTION_RATE) {
      return { isBlacklisted: true, reason: `Resale rejection rate ${stats.resaleRejectionRate * 100}% exceeds 8% limit.` };
    }
    
    return { isBlacklisted: false };
  }

  /**
   * 记录供应商表现数据 (由 WMS/VisionQC 触发) - 持久化到 Prisma
   */
  async recordPerformance(supplierId: string, metric: 'leadTime' | 'defect' | 'rejection', value: number) {
    this.logger.log(`[SupplierScore] Recording ${metric} for ${supplierId}: ${value}`);

    // 三维指标映射：leadTime / defect / rejection 全部可持久化
    const data =
      metric === 'leadTime'
        ? { avgLeadTime: value }
        : metric === 'defect'
          ? { defectRate: value }
          : metric === 'rejection'
            ? { resaleRejectionRate: value }
            : null;

    if (!data) {
      this.logger.warn(`[SupplierScore] Unknown metric "${metric}" for ${supplierId}`);
      return;
    }

    try {
      await this.prisma.aceSupplier.update({
        where: { id: supplierId },
        data,
      });
      this.logger.log(`[SupplierScore] Persisted ${metric} for ${supplierId}`);
    } catch (e) {
      this.logger.warn(`[SupplierScore] Failed to persist ${metric} for ${supplierId}: ${e}`);
    }
  }
}
