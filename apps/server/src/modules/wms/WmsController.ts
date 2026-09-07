import { Controller, Post, Get, Put, Delete, Body, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { VisionQCService } from './VisionQCService';
import { WarehouseService } from './WarehouseService';
import { PerformQCDto, CalculateCompressionDto } from '../../dto/wms.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';

@Controller('wms')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class WmsController {
  private readonly logger = new Logger(WmsController.name);

  constructor(
    private readonly visionQC: VisionQCService,
    private readonly warehouse: WarehouseService,
  ) {}

  // ─── AI 质检 ───

  @Post('qc')
  async performQC(@Body() dto: PerformQCDto) {
    this.logger.log(`[WMS] QC request for ${dto.expectedProduct.id}`);
    return this.visionQC.performQC(dto.imageUrl, dto.expectedProduct, dto.category || 'FASHION');
  }

  @Get('qc-thresholds')
  getQCThresholds() {
    return Object.entries(VisionQCService['THRESHOLDS']).map(([category, thresholds]) => ({
      category, ...thresholds,
    }));
  }

  @Post('compression')
  async calculateCompression(@Body() dto: CalculateCompressionDto) {
    return this.visionQC.calculateCompressionSavings(dto.weight, dto.originalVolume, dto.compressedVolume);
  }

  @Post('qc/order/:orderId')
  async performOrderQC(@Param('orderId') orderId: string) {
    return { orderId, status: 'QUEUED', message: 'Batch QC triggered. Check results via /wms/qc/order/:orderId/results' };
  }

  // ─── 仓库管理 ───

  @Get('warehouses')
  async listWarehouses(@Query('country') country?: string) {
    return this.warehouse.listWarehouses(country);
  }

  @Post('warehouses')
  async createWarehouse(@Body() body: { name: string; country: string; address?: string }) {
    return this.warehouse.createWarehouse(body);
  }

  @Get('warehouses/:id')
  async getWarehouse(@Param('id') id: string) {
    return this.warehouse.getWarehouse(id);
  }

  @Get('warehouses/:id/stats')
  async getWarehouseStats(@Param('id') id: string) {
    return this.warehouse.getWarehouseStats(id);
  }

  // ─── 库位管理 ───

  @Get('warehouses/:warehouseId/locations')
  async listLocations(@Param('warehouseId') warehouseId: string) {
    return this.warehouse.listLocations(warehouseId);
  }

  @Post('warehouses/:warehouseId/locations')
  async createLocation(@Param('warehouseId') warehouseId: string, @Body() body: { label: string; type?: string; capacity?: number }) {
    return this.warehouse.createLocation({ warehouseId, ...body });
  }

  @Put('locations/:id')
  async updateLocation(@Param('id') id: string, @Body() body: { status?: string; usedCount?: number }) {
    return this.warehouse.updateLocation(id, body);
  }

  // ─── 入库管理 ───

  @Get('inbounds')
  async listInbounds(
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.warehouse.listInbounds({
      warehouseId, status,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
  }

  @Post('inbounds')
  async createInbound(@Body() body: any) {
    return this.warehouse.createInbound(body);
  }

  @Get('inbounds/:id')
  async getInbound(@Param('id') id: string) {
    return this.warehouse.getInbound(id);
  }

  @Put('inbounds/:id/status')
  async updateInboundStatus(@Param('id') id: string, @Body() body: { status: string; receivedItems?: number; notes?: string }) {
    return this.warehouse.updateInboundStatus(id, body.status as any, body);
  }

  @Post('inbounds/:id/complete')
  async completeInbound(@Param('id') id: string, @Body() body?: { locationId?: string }) {
    return this.warehouse.completeInbound(id, body?.locationId);
  }

  // ─── 出库管理 ───

  @Get('outbounds')
  async listOutbounds(
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.warehouse.listOutbounds({
      warehouseId, status,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });
  }

  @Post('outbounds')
  async createOutbound(@Body() body: any) {
    return this.warehouse.createOutbound(body);
  }

  @Get('outbounds/:id')
  async getOutbound(@Param('id') id: string) {
    return this.warehouse.getOutbound(id);
  }

  @Put('outbounds/:id/status')
  async updateOutboundStatus(
    @Param('id') id: string,
    @Body() body: { status: string; pickedItems?: number; trackingNumber?: string; shippingProvider?: string; notes?: string },
  ) {
    return this.warehouse.updateOutboundStatus(id, body.status as any, body);
  }
}
