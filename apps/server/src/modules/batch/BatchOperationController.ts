import { Controller, Post, Body, Logger, UseGuards } from '@nestjs/common';
import { BatchOperationService } from './BatchOperationService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('batch')
@UseGuards(JwtAuthGuard)
export class BatchOperationController {
  private readonly logger = new Logger(BatchOperationController.name);

  constructor(private readonly batch: BatchOperationService) {}

  @Post('orders/status')
  async updateOrderStatus(@Body() body: { ids: string[]; status: string }) {
    return this.batch.batchUpdateOrderStatus(body.ids, body.status);
  }

  @Post('logistics/advance')
  async advanceLogistics(@Body() body: { orderIds: string[]; node: string; location?: string }) {
    return this.batch.batchAdvanceLogistics(body.orderIds, body.node, body.location);
  }

  @Post('purchase-orders/status')
  async updatePOStatus(@Body() body: { ids: string[]; status: string }) {
    return this.batch.batchUpdatePOStatus(body.ids, body.status);
  }

  @Post('inbounds/status')
  async updateInboundStatus(@Body() body: { ids: string[]; status: string }) {
    return this.batch.batchUpdateInboundStatus(body.ids, body.status);
  }

  @Post('outbounds/status')
  async updateOutboundStatus(@Body() body: { ids: string[]; status: string }) {
    return this.batch.batchUpdateOutboundStatus(body.ids, body.status);
  }

  @Post('products/status')
  async updateProductStatus(@Body() body: { ids: string[]; status: string }) {
    return this.batch.batchUpdateProductStatus(body.ids, body.status);
  }
}
