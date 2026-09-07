import { Controller, Post, Get, Logger, UseGuards } from '@nestjs/common';
import { ReconciliationCronService } from './ReconciliationCronService';
import { AIPushCronService } from './AIPushCronService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';

/**
 * CronController — 定时任务管理后台 API
 *
 * 提供对账结果查询、手动触发、AI推送统计等功能。
 * 解决之前对账结果只能通过日志查看的管理台盲区。
 */
@Controller('cron')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class CronController {
  private readonly logger = new Logger(CronController.name);

  constructor(
    private readonly reconciliation: ReconciliationCronService,
    private readonly aiPushCron: AIPushCronService,
  ) {}

  /**
   * 手动触发全量对账
   */
  @Post('reconciliation/run')
  async runReconciliation() {
    this.logger.log('[Cron] Manual reconciliation triggered');
    return this.reconciliation.manualReconciliation();
  }

  /**
   * 获取对账摘要
   */
  @Get('reconciliation/summary')
  async getReconciliationSummary() {
    return this.reconciliation.getReconciliationSummary();
  }

  /**
   * 获取 AI 推送统计
   */
  @Get('push-stats')
  async getPushStats() {
    return this.aiPushCron.getStats();
  }

  /**
   * 获取所有定时任务状态
   */
  @Get('status')
  getCronStatus() {
    return {
      services: [
        {
          name: 'Daily Reconciliation',
          schedule: '0 2 * * * (Daily 02:00)',
          description: '全量金库对账 + 风险池审计',
        },
        {
          name: 'Order Settlement Sync',
          schedule: '*/30 * * * * (Every 30min)',
          description: '同步 PAID → SETTLED 状态',
        },
        {
          name: 'Partner Auto Payout',
          schedule: '0 4 * * * (Daily 04:00)',
          description: '合伙人自动打款',
        },
        {
          name: 'Stale Order Cleanup',
          schedule: '0 1 * * * (Daily 01:00)',
          description: '30天未结算订单清理',
        },
        {
          name: 'AI Push Sync',
          schedule: '*/10 * * * * (Every 10min)',
          description: 'AI推送消息同步到 NotificationService',
          stats: this.aiPushCron.getStats(),
        },
      ],
    };
  }
}
