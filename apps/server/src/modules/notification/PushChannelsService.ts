import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PushChannelsService {
  private readonly logger = new Logger(PushChannelsService.name);
  private readonly waApiUrl: string;
  private readonly waToken: string;
  private readonly waPhoneId: string;
  private readonly tgToken: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.waApiUrl = this.config.get('WHATSAPP_API_URL') || '';
    this.waToken = this.config.get('WHATSAPP_ACCESS_TOKEN') || '';
    this.waPhoneId = this.config.get('WHATSAPP_PHONE_ID') || '';
    this.tgToken = this.config.get('TELEGRAM_BOT_TOKEN') || '';
  }

  /** WhatsApp 发送 (Meta Cloud API) */
  async sendWhatsApp(phone: string, text: string): Promise<{ success: boolean; channel: string }> {
    if (!this.waToken || !this.waPhoneId) {
      this.logger.warn(`[WhatsApp] Not configured, mocking: ${phone} → "${text.slice(0, 30)}..."`);
      return { success: true, channel: 'WHATSAPP_MOCK' };
    }

    try {
      const url = `${this.waApiUrl || `https://graph.facebook.com/v18.0`}/${this.waPhoneId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body: text },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        this.logger.error(`[WhatsApp] Send failed: ${err}`);
        return { success: false, channel: 'WHATSAPP' };
      }

      this.logger.log(`[WhatsApp] Sent to ${phone}`);
      return { success: true, channel: 'WHATSAPP' };
    } catch (e: any) {
      this.logger.error(`[WhatsApp] Error: ${e.message}`);
      return { success: false, channel: 'WHATSAPP' };
    }
  }

  /** Telegram 发送 */
  async sendTelegram(chatId: string, text: string): Promise<{ success: boolean; channel: string }> {
    if (!this.tgToken) {
      this.logger.warn(`[Telegram] Not configured, mocking: ${chatId} → "${text.slice(0, 30)}..."`);
      return { success: true, channel: 'TELEGRAM_MOCK' };
    }

    try {
      const url = `https://api.telegram.org/bot${this.tgToken}/sendMessage`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      });

      if (!res.ok) {
        const err = await res.text();
        this.logger.error(`[Telegram] Send failed: ${err}`);
        return { success: false, channel: 'TELEGRAM' };
      }

      this.logger.log(`[Telegram] Sent to ${chatId}`);
      return { success: true, channel: 'TELEGRAM' };
    } catch (e: any) {
      this.logger.error(`[Telegram] Error: ${e.message}`);
      return { success: false, channel: 'TELEGRAM' };
    }
  }

  /** 记录通知到 ace_notifications */
  async recordNotification(params: {
    userId?: string; type: string; channel: string;
    title: string; body: string; metadata?: any;
  }) {
    return this.prisma.aceNotification.create({
      data: {
        userId: params.userId || null,
        type: params.type,
        channel: params.channel,
        title: params.title,
        body: params.body,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  /** 通知列表 */
  async listNotifications(params: { userId?: string; type?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (params.userId) where.userId = params.userId;
    if (params.type) where.type = params.type;

    const [data, total] = await Promise.all([
      this.prisma.aceNotification.findMany({
        where, orderBy: { createdAt: 'desc' },
        skip: ((params.page || 1) - 1) * (params.pageSize || 20),
        take: params.pageSize || 20,
      }),
      this.prisma.aceNotification.count({ where }),
    ]);
    return { data, total };
  }

  /** 标记已读 */
  async markAsRead(id: string) {
    return this.prisma.aceNotification.update({
      where: { id },
      data: { readAt: new Date(), status: 'READ' },
    });
  }
}
