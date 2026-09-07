import { Controller, Post, Get, Body, Param, Logger, UseGuards } from '@nestjs/common';
import { InventoryService } from './InventoryService';
import { DeductDto, DeductBatchDto, RestoreDto, ValidateStockDto } from '../../dto/inventory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';

@Controller('inventory')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);

  constructor(private readonly inventory: InventoryService) {}

  /**
   * 原子扣减库存
   */
  @Post('deduct')
  async deduct(@Body() dto: DeductDto) {
    this.logger.log(`[Inventory] Deduct ${dto.quantity}x from ${dto.productId}`);
    return this.inventory.deduct(dto.productId, dto.quantity);
  }

  /**
   * 批量扣减库存（整个订单）
   */
  @Post('deduct-batch')
  async deductBatch(@Body() dto: DeductBatchDto) {
    return this.inventory.deductBatch(dto.items);
  }

  /**
   * 退款回仓
   */
  @Post('restore')
  async restore(@Body() dto: RestoreDto) {
    return this.inventory.restore(dto.productId, dto.quantity);
  }

  /**
   * 批量校验库存（下单前预检）
   */
  @Post('validate')
  async validateStock(@Body() dto: ValidateStockDto) {
    return this.inventory.validateStock(dto.items);
  }

  /**
   * 获取产品库存
   */
  @Get(':productId')
  async getStock(@Param('productId') productId: string) {
    // 通过 validateStock 间接获取库存信息
    const result = await this.inventory.validateStock([{ productId, quantity: 1 }]);
    return { productId, available: result.valid, errors: result.errors };
  }
}
