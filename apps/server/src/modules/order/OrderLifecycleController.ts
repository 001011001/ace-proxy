import { Controller, Post, Get, Body, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { OrderLifecycleService } from './OrderLifecycleService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';

@Controller('order-lifecycle')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class OrderLifecycleController {
  private readonly logger = new Logger(OrderLifecycleController.name);

  constructor(private readonly lifecycle: OrderLifecycleService) {}

  /**
   * 推进订单状态（管理后台手动推进）
   */
  @Post('advance')
  async advanceOrder(@Body() body: {
    orderId: string;
    targetNode: string;
    location?: string;
    note?: string;
    operatorId?: string;
    autoQC?: boolean;
  }) {
    return this.lifecycle.advanceOrder(body.orderId, body.targetNode, {
      location: body.location,
      note: body.note,
      operatorId: body.operatorId,
      autoQC: body.autoQC,
    });
  }

  /**
   * 一键完成从 PAID→PURCHASED 的自动化履约
   */
  @Post(':orderId/auto-fulfill')
  async autoFulfill(@Param('orderId') orderId: string) {
    return this.lifecycle.autoFulfillFromPaid(orderId);
  }

  /**
   * 获取订单完整状态（含时间线 + 合规审计）
   */
  @Get(':orderId/status')
  async getOrderStatus(@Param('orderId') orderId: string) {
    return this.lifecycle.getOrderStatus(orderId);
  }
}
