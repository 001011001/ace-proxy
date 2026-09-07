import { Controller, Get, Post, Put, Param, Query, Body, Logger, UseGuards } from '@nestjs/common';
import { PurchaseOrderService } from './PurchaseOrderService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard)
export class PurchaseOrderController {
  private readonly logger = new Logger(PurchaseOrderController.name);

  constructor(private readonly poService: PurchaseOrderService) {}

  /** 采购单列表 */
  @Get()
  async list(
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.poService.findAll({
      status,
      supplierId,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
  }

  /** 采购单详情 */
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.poService.findOne(id);
  }

  /** 创建采购单 */
  @Post()
  async create(@Body() body: any) {
    this.logger.log(`[PO Controller] Creating PO, ${body.items?.length || 0} items`);
    return this.poService.create(body);
  }

  /** 更新采购单状态 */
  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.poService.updateStatus(id, status as any);
  }

  /** 从订单创建采购单 */
  @Post('from-order/:orderId')
  async createFromOrder(@Param('orderId') orderId: string) {
    this.logger.log(`[PO Controller] Creating PO from order ${orderId}`);
    return this.poService.createFromOrder(orderId);
  }

  /** 更新采购单项状态 */
  @Put(':poId/items/:itemId/status')
  async updateItemStatus(
    @Param('poId') poId: string,
    @Param('itemId') itemId: string,
    @Body('status') status: string,
  ) {
    return this.poService.updateItemStatus(poId, itemId, status as any);
  }

  /** 更新采购单 */
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.poService.update(id, body);
  }

  /**
   * 管理员履行采购单（填写1688下单信息+推进状态）
   * 这是代付链路的关键操作
   */
  @Put(':id/fulfill')
  async fulfill(
    @Param('id') id: string,
    @Body() body: {
      sourceUrl?: string;
      trackingNumber?: string;
      notes?: string;
      newStatus?: string;
      totalCostCny?: number;
    },
  ) {
    this.logger.log(`[PO Controller] Fulfill PO ${id}: ${JSON.stringify(body)}`);
    return this.poService.fulfill(id, body as any);
  }
}
