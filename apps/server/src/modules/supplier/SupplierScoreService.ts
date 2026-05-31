import { Injectable, Logger } from '@nestjs/common';

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
   * 记录供应商表现数据 (由 WMS/VisionQC 触发)
   */
  async recordPerformance(supplierId: string, metric: 'leadTime' | 'defect' | 'rejection', value: number) {
    this.logger.log(`[SupplierScore] Recording ${metric} for ${supplierId}: ${value}`);
    // 持久化逻辑...
  }
}
