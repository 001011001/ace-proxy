import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RegionService } from '../region/RegionService';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * RiskSentryService - 资损熔断器
 *
 * 功能：
 * - 从数据库获取活跃站点，动态计算各区域退款率
 * - 超过 5% 阈值时自动触发熔断（关闭广告投放）
 * - 每 5 分钟 Cron 审计一次
 */
@Injectable()
export class RiskSentryService {
  private readonly logger = new Logger(RiskSentryService.name);

  constructor(
    private readonly regionService: RegionService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /risk-sentry/alerts — 获取当前告警列表（从真实数据聚合）
   */
  async getAlerts() {
    try {
      // 从数据库获取活跃站点
      const stations = await this.prisma.aceStation.findMany({
        where: { status: 'ACTIVE' },
      });

      const alerts: any[] = [];

      // 对每个站点计算退款率
      for (const station of stations) {
        const totalOrders = await this.prisma.aceOrder.count({
          where: { country: station.code },
        });
        if (totalOrders === 0) continue;

        const refundOrders = await this.prisma.aceOrder.count({
          where: { country: station.code, status: 'REFUNDED' },
        });
        const refundRate = Math.round((refundOrders / totalOrders) * 1000) / 10;

        if (refundRate >= 5) {
          alerts.push({
            id: `ALT-${station.code}-${Date.now()}`,
            type: 'CHARGEBACK_RATE',
            severity: 'HIGH',
            region: station.code,
            message: `${station.name} chargeback rate at ${refundRate}% (threshold: 5%)`,
            triggeredAt: new Date(),
            status: 'ACTIVE',
          });
        } else if (refundRate >= 3) {
          alerts.push({
            id: `ALT-${station.code}-${Date.now()}`,
            type: 'CHARGEBACK_RATE',
            severity: 'MEDIUM',
            region: station.code,
            message: `${station.name} chargeback rate approaching threshold at ${refundRate}%`,
            triggeredAt: new Date(),
            status: 'MONITORING',
          });
        }
      }

      return alerts;
    } catch (e) {
      this.logger.warn(`[RiskSentry] Failed to compute dynamic alerts: ${e}`);
      return []; // 失败时返回空数组而非假数据
    }
  }

  /**
   * GET /risk-sentry/health — 各区域健康指标（从真实数据聚合）
   */
  async getHealthMetrics() {
    try {
      const stations = await this.prisma.aceStation.findMany({
        where: { status: 'ACTIVE' },
      });

      const regions: any[] = [];
      let totalAlerts = 0;

      for (const station of stations) {
        const totalOrders = await this.prisma.aceOrder.count({
          where: { country: station.code },
        });
        const refundOrders = await this.prisma.aceOrder.count({
          where: { country: station.code, status: 'REFUNDED' },
        });
        const chargebackRate = totalOrders > 0
          ? Math.round((refundOrders / totalOrders) * 1000) / 10
          : 0;

        let status = 'SECURE';
        if (chargebackRate >= 5) {
          status = 'CRITICAL';
          totalAlerts++;
        } else if (chargebackRate >= 3) {
          status = 'DEGRADED';
          totalAlerts++;
        }

        regions.push({
          id: station.code,
          name: station.name,
          status,
          chargebackRate,
          lastAudit: new Date(),
        });
      }

      const criticalCount = regions.filter(r => r.status === 'CRITICAL').length;

      return {
        overallStatus: criticalCount > 0 ? 'DEGRADED' : 'OPERATIONAL',
        regions,
        activeAlerts: totalAlerts,
        circuitBreakerActive: criticalCount > 0,
        affectedRegion: criticalCount > 0 ? regions.filter(r => r.status === 'CRITICAL').map(r => r.id).join(',') : null,
      };
    } catch (e) {
      this.logger.warn(`[RiskSentry] Failed to compute health metrics: ${e}`);
      return {
        overallStatus: 'UNKNOWN',
        regions: [],
        activeAlerts: 0,
        circuitBreakerActive: false,
        affectedRegion: null,
      };
    }
  }

  /**
   * 每 5 分钟 Cron 审计各区域退款率
   * 超过 5% 阈值自动熔断
   */
  @Cron('*/5 * * * *')
  async auditRegionHealth() {
    try {
      const stations = await this.prisma.aceStation.findMany({
        where: { status: 'ACTIVE' },
      });

      for (const station of stations) {
        const rate = await this.regionService.getChargebackRate(station.code);

        if (rate > 0.05) {
          this.logger.error(
            `[CRITICAL] Region ${station.code} chargeback rate (${(rate * 100).toFixed(1)}%) exceeds 5% threshold! Triggering circuit breaker.`,
          );

          await this.regionService.updateSettings(station.code, {
            isAdEnabled: false,
            riskLevel: 'CRITICAL',
            lastMeltdownAt: new Date(),
          });
        }
      }
    } catch (e) {
      this.logger.error(`[RiskSentry] Audit cron failed: ${e}`);
    }
  }
}
