import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * CronService — 定时任务
 * - 24h 未支付订单自动取消
 * - 7天购物车过期清理
 * - 限流缓存清理
 */
@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** 每10分钟检查：24h未支付订单 → EXPIRED */
  @Cron('0 */10 * * * *')
  async cancelExpiredOrders() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await this.prisma.aceOrder.updateMany({
      where: {
        status: 'PAID',
        createdAt: { lt: cutoff },
      },
      data: { status: 'EXPIRED' },
    });

    if (result.count > 0) {
      this.logger.log(`[Cron] Cancelled ${result.count} expired orders (PAID > 24h)`);
    }
  }

  /** 每天凌晨清理7天前的购物车 */
  @Cron('0 0 3 * * *')
  async cleanupCart() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await this.prisma.aceCartItem.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    if (result.count > 0) {
      this.logger.log(`[Cron] Cleaned up ${result.count} expired cart items (> 7 days)`);
    }
  }
}
