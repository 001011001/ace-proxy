import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type PushType = 'BROWSE_RECALL' | 'DROPPED_PRICE' | 'CONSOLIDATION_TIP' | 'TRACKING_UPDATE' | 'REBUY_SUGGEST';

export interface PushMessage {
  type: PushType;
  title: string;
  body: string;
  data?: Record<string, string>;
  userId: string;
  sendAt?: Date;
}

/**
 * AiPushService — AI 智能推送
 *
 * 四种推送类型：
 * 1. BROWSE_RECALL — 浏览召回（1h/24h/48h）
 * 2. DROPPED_PRICE — 降价提醒
 * 3. CONSOLIDATION_TIP — 集运凑单（"再买XX凑满享更低运费"）
 * 4. REBUY_SUGGEST — 复购推荐
 */
@Injectable()
export class AiPushService {
  private readonly logger = new Logger(AiPushService.name);
  private readonly pushStore: PushMessage[] = [];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 浏览召回：用户浏览商品后定时推送
   * 策略：1小时后首推 → 24h后二推 → 48h后三推（三推后停止）
   */
  async scheduleBrowseRecall(userId: string, productId: string) {
    const product = await this.prisma.aceProduct.findUnique({
      where: { id: productId },
      select: { name: true, priceIdr: true, imageUrls: true },
    });

    if (!product) return;

    const messages: PushMessage[] = [
      {
        type: 'BROWSE_RECALL',
        userId,
        title: 'Still thinking about it? 👀',
        body: `"${product.name}" is still in stock! Tap to check out · Rp ${Number(product.priceIdr).toLocaleString()}`,
        data: { productId, type: '1h' },
        sendAt: new Date(Date.now() + 60 * 60 * 1000),
      },
      {
        type: 'BROWSE_RECALL',
        userId,
        title: 'Don\'t miss out! ⏰',
        body: `"${product.name}" — others are buying this. Price may go up soon.`,
        data: { productId, type: '24h' },
        sendAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    ];

    for (const msg of messages) {
      this.pushStore.push(msg);
      this.logger.log(`[Push] Scheduled BROWSE_RECALL for user ${userId} → product ${productId} at ${msg.sendAt?.toISOString()}`);
    }
  }

  /**
   * 降价提醒
   */
  async notifyPriceDrop(userId: string, productId: string, oldPrice: number, newPrice: number) {
    const dropPct = Math.round((1 - newPrice / oldPrice) * 100);
    if (dropPct < 5) return; // 降幅<5%不推送

    const product = await this.prisma.aceProduct.findUnique({
      where: { id: productId },
      select: { name: true },
    });

    const msg: PushMessage = {
      type: 'DROPPED_PRICE',
      userId,
      title: `Price dropped ${dropPct}%! 📉`,
      body: `"${product?.name}" was Rp ${oldPrice.toLocaleString()}, now Rp ${newPrice.toLocaleString()}. Grab it before it goes back up.`,
      data: { productId, oldPrice: String(oldPrice), newPrice: String(newPrice), dropPct: String(dropPct) },
    };

    this.pushStore.push(msg);
    this.logger.log(`[Push] DROPPED_PRICE for ${productId}: -${dropPct}%`);
  }

  /**
   * 集运凑单提醒
   * "你的包裹现在Xkg，再凑Ykg就能解锁更低运费！"
   */
  async suggestConsolidation(userId: string, currentWeightKg: number, targetWeightKg: number, country: string) {
    const gap = Math.max(0, targetWeightKg - currentWeightKg);
    if (gap < 0.15) return;

    // 推荐凑单品
    const suggestions = await this.prisma.aceProduct.findMany({
      where: { status: 'ACTIVE', costCny: { lte: 50 } },
      take: 3,
      orderBy: { ratingCount: 'desc' },
      select: { id: true, name: true, priceIdr: true },
    });

    const msg: PushMessage = {
      type: 'CONSOLIDATION_TIP',
      userId,
      title: `Add ~${gap.toFixed(1)}kg to save on shipping! 📦`,
      body: suggestions.length > 0
        ? `Try adding "${suggestions[0].name}" to your cart for cheaper consolidated shipping.`
        : `Add more items to unlock our best shipping rates.`,
      data: {
        currentWeight: String(currentWeightKg),
        targetWeight: String(targetWeightKg),
        suggestedProductId: suggestions[0]?.id || '',
      },
    };

    this.pushStore.push(msg);
  }

  /**
   * 复购推荐（用户签收后 N 天推送）
   */
  async scheduleRebuyReminder(userId: string, productId: string) {
    const product = await this.prisma.aceProduct.findUnique({
      where: { id: productId },
      select: { name: true },
    });

    const msg: PushMessage = {
      type: 'REBUY_SUGGEST',
      userId,
      title: 'Running low? Reorder with one tap 🔄',
      body: `"${product?.name}" — loved it? Get it again, now 5% faster.`,
      data: { productId, type: 'rebuy_30d' },
      sendAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    this.pushStore.push(msg);
    this.logger.log(`[Push] Scheduled REBUY_SUGGEST for ${userId} in 30 days`);
  }

  /**
   * 获取待推送消息（由 CronJob 或 API 调用触发）并清空已发送的
   */
  getPending(): PushMessage[] {
    const now = new Date();
    const ready = this.pushStore.filter(m => !m.sendAt || m.sendAt <= now);
    // 保留未来的消息
    const future = this.pushStore.filter(m => m.sendAt && m.sendAt > now);
    this.pushStore.length = 0;
    this.pushStore.push(...future);
    return ready;
  }

  /**
   * 获取所有待推送消息数
   */
  getStats() {
    return { pending: this.pushStore.length, types: this.pushStore.map(m => m.type) };
  }
}
