import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RegionService } from '../region/RegionService';

/**
 * RiskSentryService - 资损熔断器
 * 核心逻辑：监控各区域拒付率，超过 5% 阈值自动下线广告投放。
 */
@Injectable()
export class RiskSentryService {
  private readonly logger = new Logger(RiskSentryService.name);

  constructor(private readonly regionService: RegionService) {}

  @Cron('*/5 * * * *') // 每 5 分钟执行一次审计
  async auditRegionHealth() {
    const regions = ['JKT', 'LDN']; // 实际应从数据库查询活跃区域
    
    for (const regionId of regions) {
      const rate = await this.regionService.getChargebackRate(regionId);
      
      if (rate > 0.05) {
        this.logger.error(`[CRITICAL] Region ${regionId} chargeback rate (${rate}) exceeds 5% threshold! Triggering circuit breaker.`);
        
        // 自动熔断：下线该区域广告推送，提升风险等级
        await this.regionService.updateSettings(regionId, { 
          isAdEnabled: false, 
          riskLevel: 'CRITICAL',
          lastMeltdownAt: new Date()
        });

        // TODO: 通过 Webhook 触发前端/广告投放平台的营销停止指令
      }
    }
  }
}
