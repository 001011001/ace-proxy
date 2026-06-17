import { Controller, Get, Post, Body } from '@nestjs/common';
import { AiPushService } from './AiPushService';

@Controller('push')
export class AiPushController {
  constructor(private readonly service: AiPushService) {}

  @Get('stats')
  async getStats() {
    return this.service.getStats();
  }

  @Get('pending')
  async getPending() {
    return this.service.getPending();
  }

  @Post('schedule-browse-recall')
  async scheduleBrowseRecall(@Body() body: { userId: string; productId: string }) {
    await this.service.scheduleBrowseRecall(body.userId, body.productId);
    return { scheduled: true };
  }

  @Post('schedule-rebuy')
  async scheduleRebuy(@Body() body: { userId: string; productId: string }) {
    await this.service.scheduleRebuyReminder(body.userId, body.productId);
    return { scheduled: true };
  }
}
