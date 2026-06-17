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

  async getAlerts() {
    return [
      { id: 'ALT-001', type: 'CHARGEBACK_RATE', severity: 'HIGH', region: 'JKT', message: 'Jabodetabek chargeback rate at 6.2% (threshold: 5%)', triggeredAt: new Date(), status: 'ACTIVE' },
      { id: 'ALT-002', type: 'PAYMENT_OUTAGE', severity: 'MEDIUM', region: 'ALL', message: 'Xendit VA payment method experiencing 12% failure rate', triggeredAt: new Date(Date.now() - 3600000), status: 'ACTIVE' },
      { id: 'ALT-003', type: 'REFUND_SPIKE', severity: 'MEDIUM', region: 'TH', message: 'Thailand refund rate spiked to 8.3% (avg: 3.1%)', triggeredAt: new Date(Date.now() - 7200000), status: 'ACTIVE' },
      { id: 'ALT-004', type: 'LOGISTICS_DELAY', severity: 'LOW', region: 'PH', message: 'Manila last-mile delivery 48h+ for 15% of orders', triggeredAt: new Date(Date.now() - 14400000), status: 'MONITORING' },
      { id: 'ALT-005', type: 'CURRENCY_VOLATILITY', severity: 'LOW', region: 'ALL', message: 'IDR/CNY exchange rate fluctuation 1.8% in 24h', triggeredAt: new Date(Date.now() - 21600000), status: 'MONITORING' },
    ];
  }

  async getHealthMetrics() {
    return {
      overallStatus: 'DEGRADED',
      regions: [
        { id: 'JKT', name: 'Jakarta', status: 'CRITICAL', chargebackRate: 6.2, lastAudit: new Date() },
        { id: 'LDN', name: 'London', status: 'SECURE', chargebackRate: 1.1, lastAudit: new Date() },
      ],
      activeAlerts: 3,
      totalAlerts7d: 7,
      circuitBreakerActive: true,
      affectedRegion: 'JKT',
    };
  }

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
