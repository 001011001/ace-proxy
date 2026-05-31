import { Injectable, Logger } from '@nestjs/common';

/**
 * RegionService - 区域逻辑与状态管理
 * 支持根据区域政策（如印尼 PMK 96/2023）动态切换业务规则。
 */
@Injectable()
export class RegionService {
  private readonly logger = new Logger(RegionService.name);

  // 模拟区域状态存储
  private regionSettings: Record<string, any> = {
    'JKT': { isAdEnabled: true, riskLevel: 'LOW', chargebackRate: 0.01 },
    'LDN': { isAdEnabled: true, riskLevel: 'LOW', chargebackRate: 0.005 },
  };

  async getSettings(regionId: string) {
    return this.regionSettings[regionId] || { isAdEnabled: true, riskLevel: 'NORMAL' };
  }

  async updateSettings(regionId: string, patch: any) {
    this.regionSettings[regionId] = { ...this.regionSettings[regionId], ...patch };
    this.logger.log(`Region ${regionId} settings updated: ${JSON.stringify(patch)}`);
  }

  /**
   * 获取各区域拒付率数据，供熔断器审计
   */
  async getChargebackRate(regionId: string): Promise<number> {
    return this.regionSettings[regionId]?.chargebackRate || 0;
  }
}
