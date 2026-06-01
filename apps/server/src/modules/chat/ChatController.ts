import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ChatService } from './ChatService';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  /**
   * WhatsApp Webhook 入口
   */
  @Post('webhook/whatsapp')
  async handleWhatsAppWebhook(@Body() payload: any) {
    this.logger.log(`[Webhook] Received WhatsApp payload: ${JSON.stringify(payload)}`);
    
    const { from, body, orderId, userId } = payload; // 简化结构
    
    if (body && orderId && userId) {
      return this.chatService.handleUserMessage(orderId, userId, body);
    }

    return { success: false, reason: 'INVALID_PAYLOAD' };
  }

  /**
   * 模拟 1688 卖家回复回调 (内部系统使用)
   */
  @Post('supplier-reply')
  async handleSupplierReply(@Body() body: { orderId: string, content: string }) {
    return this.chatService.handleSupplierReply(body.orderId, body.content);
  }
}
