import { Controller, Post, Body, Logger, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './ChatService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StewardChatDto } from '../../dto/chat.dto';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  /**
   * AI Steward 智能对话（给网页前端和 App 用）
   * POST /api/v1/chat/steward
   */
  @UseGuards(JwtAuthGuard)
  @Post('steward')
  async stewardChat(
    @Req() req: any,
    @Body() body: StewardChatDto,
  ) {
    return this.chatService.stewardChat(req.user.userId, body.message, body.history || []);
  }

  /**
   * WhatsApp Webhook 入口
   * TODO: 添加 WhatsApp 签名验证
   */
  @Post('webhook/whatsapp')
  async handleWhatsAppWebhook(@Body() payload: any) {
    this.logger.log(`[Webhook] Received WhatsApp payload`);
    const { from, body, orderId, userId } = payload;
    if (body && orderId && userId) {
      return this.chatService.handleUserMessage(orderId, userId, body);
    }
    return { success: false, reason: 'INVALID_PAYLOAD' };
  }

  /**
   * 模拟 1688 卖家回复回调 (内部系统使用)
   */
  @UseGuards(JwtAuthGuard)
  @Post('supplier-reply')
  async handleSupplierReply(@Body() body: { orderId: string; content: string }) {
    return this.chatService.handleSupplierReply(body.orderId, body.content);
  }
}
