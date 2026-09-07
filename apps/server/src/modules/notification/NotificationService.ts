import { Injectable, Logger } from '@nestjs/common';
import { ConfigurationError, isDevMockEnabled } from '../../common/ConfigurationError';
import { generateMessageSid } from '../../common/uuid';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 站内通知数据结构
 */
interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * NotificationService - 实时推送与消息中心
 *
 * 集成 FCM (Firebase) 和 APNs (Apple) 接口。
 * 现已增加站内通知记录（Prisma ChatLog 表复用）。
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma?: PrismaService) {}

  /**
   * 创建站内通知（复用 ChatLog 表作为通用日志存储）。
   *
   * @note 当前复用 ChatLog 表记录通知（role='system'，intent='notification'）。
   *       正式上线前建议增加独立的 AceNotification 表。
   * @todo P2 — 增加 AceNotification Prisma 模型，独立存储通知记录
   */
  private async createNotification(payload: NotificationPayload): Promise<void> {
    try {
      if (this.prisma) {
        await this.prisma.chatLog.create({
          data: {
            sessionId: `notif_${payload.userId}`,
            userId: payload.userId,
            role: 'system',
            content: `[${payload.type}] ${payload.title}: ${payload.body}`,
            intent: 'notification',
            metadata: JSON.stringify(payload.data || {}),
          },
        });
      }
    } catch (e: any) {
      this.logger.warn(`[Notification] Failed to persist notification: ${e.message}`);
    }
  }

  /**
   * 发送物流状态变更通知
   */
  async sendLogisticUpdate(userId: string, status: string, trackingId: string) {
    this.logger.log(`[Notification] Sending logistic update to user ${userId}: ${status}`);

    const title = '📦 您的包裹有新动态！';
    const body = `状态更新为: ${status}。点击查看详细物流。`;

    // 站内通知（写入 ChatLog）
    await this.createNotification({
      userId,
      type: 'LOGISTIC_UPDATE',
      title,
      body,
      data: { trackingId },
    });

    // FCM / APNs 推送（骨架，待接入真实 SDK）
    // @todo P2 — 接入 Firebase Admin SDK 发送真实推送
    this.logger.log(`[Notification] Would send push to ${userId}: ${title}`);

    return { success: true, messageId: `msg_${Date.now()}` };
  }

  /**
   * 发送利差预警或营销消息
   */
  async sendMarketingBlast(userIds: string[], content: string) {
    this.logger.log(`[Notification] Blasting marketing message to ${userIds.length} users.`);

    // 批量站内通知（限制并发）
    const batch = userIds.slice(0, 50); // 防止一次写入过多
    await Promise.allSettled(
      batch.map((uid) =>
        this.createNotification({
          userId: uid,
          type: 'MARKETING_BLAST',
          title: '🎉 AceProxy 限时优惠',
          body: content,
        }),
      ),
    );

    return { success: true, count: userIds.length };
  }

  /**
   * 集成 WhatsApp 消息接口 (Jakarta 试点核心信任链路)
   *
   * 雅加达用户习惯在 WhatsApp 沟通，这是建立"代购信任感"的生命线。
   *
   * @todo P1 — 接入真实 Meta WhatsApp Business API (Cloud API)
   */
  async sendWhatsAppMessage(phone: string, text: string) {
    if (!isDevMockEnabled()) {
      throw new ConfigurationError('Notification/WhatsApp', ['WHATSAPP_API_URL', 'WHATSAPP_ACCESS_TOKEN']);
    }
    this.logger.log(`[Notification] DEV_MOCK: Simulating WhatsApp to ${phone}: ${text.substring(0, 20)}...`);

    // 模拟集成 Meta WhatsApp Business API 或本地集成商 (如 Twilio/Smooch)
    const payload = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: text },
    };

    // 生产环境调用: await this.http.post(WHATSAPP_API_URL, payload, { headers });
    return { success: true, sid: generateMessageSid() };
  }
}
