import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { LogisticsTrackingService } from './LogisticsTrackingService';

@Controller('logistics')
export class LogisticsTrackingController {
  constructor(private readonly tracking: LogisticsTrackingService) {}

  @Post('advance/:orderId')
  async advance(
    @Param('orderId') orderId: string,
    @Body() body: { targetNode: string; location?: string; note?: string; operatorId?: string },
  ) {
    return this.tracking.advance(orderId, body.targetNode as any, {
      location: body.location,
      note: body.note,
      operatorId: body.operatorId,
    });
  }

  @Get('timeline/:orderId')
  async getTimeline(@Param('orderId') orderId: string, @Query('lang') lang?: string) {
    return this.tracking.getTimeline(orderId, lang || 'EN');
  }

  @Post('bulk-advance')
  async bulkAdvance(@Body() body: { orderIds: string[]; targetNode: string; location?: string; note?: string }) {
    const count = await this.tracking.bulkAdvance(body.orderIds, body.targetNode as any, {
      location: body.location,
      note: body.note,
    });
    return { success: true, advancedCount: count };
  }

  @Post('qc-result/:orderId')
  async handleQC(
    @Param('orderId') orderId: string,
    @Body() body: { passed: boolean; note?: string },
  ) {
    return this.tracking.handleQCResult(orderId, body.passed, body.note);
  }

  @Get('stats')
  async getStats() {
    return this.tracking.getStats();
  }

  @Get('delays')
  async getDelayedOrders() {
    return this.tracking.getDelays();
  }
}
