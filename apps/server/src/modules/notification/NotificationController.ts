import { Controller, Get, Post, Put, Param, Query, Body, Logger, UseGuards } from '@nestjs/common';
import { NotificationService } from './NotificationService';
import { PushChannelsService } from './PushChannelsService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(
    private readonly notif: NotificationService,
    private readonly push: PushChannelsService,
  ) {}

  @Get()
  async list(
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.push.listNotifications({
      userId, type,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.push.markAsRead(id);
  }

  @Post('whatsapp')
  async sendWhatsApp(@Body() body: { phone: string; text: string; userId?: string; type?: string }) {
    const result = await this.push.sendWhatsApp(body.phone, body.text);
    await this.push.recordNotification({
      userId: body.userId, type: body.type || 'MANUAL',
      channel: 'WHATSAPP', title: 'WhatsApp Message', body: body.text,
    });
    return result;
  }

  @Post('telegram')
  async sendTelegram(@Body() body: { chatId: string; text: string; userId?: string; type?: string }) {
    const result = await this.push.sendTelegram(body.chatId, body.text);
    await this.push.recordNotification({
      userId: body.userId, type: body.type || 'MANUAL',
      channel: 'TELEGRAM', title: 'Telegram Message', body: body.text,
    });
    return result;
  }

  @Post('blast')
  async marketingBlast(@Body() body: { userIds: string[]; content: string }) {
    return this.notif.sendMarketingBlast(body.userIds, body.content);
  }
}
