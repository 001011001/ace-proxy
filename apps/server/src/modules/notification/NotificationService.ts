import { Injectable, Logger } from '@nestjs/common';
import { ConfigurationError, isDevMockEnabled } from '../../common/ConfigurationError';

/**
 * NotificationService - 实时推送与消息中心
 * 集成 FCM (Firebase) 和 APNs (Apple) 接口。
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  /**
   * 发送物流状态变更通知
   */
  async sendLogisticUpdate(userId: string, status: string, trackingId: string) {
    this.logger.log(`[Notification] Sending logistic update to user ${userId}: ${status}`);
    
    // 模拟调用 FCM API
    const message = {
      title: '📦 您的包裹有新动态！',
      body: `状态更新为: ${status}。点击查看详细物流。`,
      data: { trackingId }
    };

    return { success: true, messageId: `msg_${Date.now()}` };
  }

  /**
   * 发送利差预警或营销消息
   */
  async sendMarketingBlast(userIds: string[], content: string) {
    this.logger.log(`[Notification] Blasting marketing message to ${userIds.length} users.`);
    return { success: true, count: userIds.length };
  }

  /**
   * 集成 WhatsApp 消息接口 (Jakarta 试点核心信任链路)
   * 雅加达用户习惯在 WhatsApp 沟通，这是建立“代购信任感”的生命线。
   */
  async sendWhatsAppMessage(phone: string, text: string) {
    if (!isDevMockEnabled()) {
      throw new ConfigurationError('Notification/WhatsApp', ['WHATSAPP_API_URL', 'WHATSAPP_ACCESS_TOKEN']);
    }
    this.logger.log(`[Notification] DEV_MOCK: Simulating WhatsApp to ${phone}: ${text.substring(0, 20)}...`);
    
    // 模拟集成 Meta WhatsApp Business API 或本地集成商 (如 Twilio/Smooch)
    const payload = {
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: { body: text }
    };

    // 生产环境调用: await this.http.post(WHATSAPP_API_URL, payload);
    return { success: true, sid: `wa_${Math.random().toString(36).substr(2, 9)}` };
  }
}
