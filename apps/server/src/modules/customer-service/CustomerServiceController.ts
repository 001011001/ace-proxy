import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AiCustomerService } from './AiCustomerService';

@Controller('api/customer-service')
export class CustomerServiceController {
  constructor(private readonly cs: AiCustomerService) {}

  @Post('chat')
  async chat(@Body() body: { userId: string; orderId?: string; message: string; language?: string }) {
    return this.cs.handleQuery({
      userId: body.userId,
      orderId: body.orderId,
      message: body.message,
      language: body.language || 'ID',
    });
  }

  @Get('order-context/:orderId')
  async getOrderContext(@Param('orderId') orderId: string) {
    return this.cs.getOrderContext(orderId);
  }
}
