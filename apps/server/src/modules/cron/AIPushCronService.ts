import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AiPushService } from '../push/AiPushService';
import { NotificationService } from '../notification/NotificationService';

/**
 * AIPushCronService — AI 推送定时同步任务
 *
 * 每 10 分钟从 AiPushService 获取待推送消息，
 * 调用 NotificationService 真正发送推送通知。
 * 解决 AiPushService 内存存储重启丢失的断裂问题。
 */
@Injectable()
export class AIPushCronService {
  private readonly logger = new Logger(AIPushCronService.name);
  private lastRunAt: string | null = null;
  private totalProcessed = 0;
  private lastBatchCount = 0;

  constructor(
    private readonly push: AiPushService,
    private readonly notification: NotificationService,
  ) {}

  /**
   * 每 10 分钟 — 同步待推送消息到 NotificationService
   */
  @Cron('*/10 * * * *')
  async syncPendingPushes() {
    this.logger.log('[AIPushCron] Syncing pending push messages...');

    const pendingMessages = this.push.getPending();
    if (pendingMessages.length === 0) {
      this.lastRunAt = new Date().toISOString();
      return;
    }

    let processed = 0;
    let failed = 0;

    for (const msg of pendingMessages) {
      try {
        // 发送通知到真实推送管道
        if (msg.type === 'BROWSE_RECALL' || msg.type === 'DROPPED_PRICE' || msg.type === 'REBUY_SUGGEST') {
          await this.notification.sendMarketingBlast([msg.userId], msg.body);
        } else if (msg.type === 'CONSOLIDATION_TIP') {
          await this.notification.sendMarketingBlast([msg.userId], msg.body);
        } else {
          await this.notification.sendLogisticUpdate(msg.userId, msg.type, msg.data?.productId || '');
        }
        processed++;
      } catch (e) {
        failed++;
        this.logger.warn(`[AIPushCron] Failed to send push to ${msg.userId}: ${e}`);
      }
    }

    this.lastRunAt = new Date().toISOString();
    this.lastBatchCount = processed;
    this.totalProcessed += processed;

    this.logger.log(
      `[AIPushCron] Sync complete: ${processed} sent, ${failed} failed, ${this.totalProcessed} total all-time`,
    );
  }

  /**
   * 获取推送统计（供 Cron Controller 查询）
   */
  getStats() {
    return {
      totalProcessed: this.totalProcessed,
      lastBatchCount: this.lastBatchCount,
      lastRunAt: this.lastRunAt,
      pendingInQueue: this.push.getStats().pending,
    };
  }
}
