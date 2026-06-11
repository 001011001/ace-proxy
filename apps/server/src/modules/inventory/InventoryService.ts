import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * InventoryService — 库存扣减与校验
 * 下单时原子性扣减，防超卖
 */
@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 原子扣减库存（乐观锁）
   * @returns 扣减成功后的剩余库存
   */
  async deduct(productId: string, quantity: number): Promise<number> {
    const result = await this.prisma.aceProduct.updateMany({
      where: {
        id: productId,
        stock: { gte: quantity },
      },
      data: {
        stock: { decrement: quantity },
      },
    });

    if (result.count === 0) {
      throw new BadRequestException(`Stock insufficient for product ${productId}`);
    }

    const updated = await this.prisma.aceProduct.findUnique({
      where: { id: productId },
      select: { stock: true, name: true },
    });

    this.logger.log(`[Inventory] Deducted ${quantity}x "${updated?.name}". Remaining: ${updated?.stock}`);
    return updated?.stock || 0;
  }

  /**
   * 批量扣减（整个订单的商品）
   */
  async deductBatch(items: { productId: string; quantity: number }[]): Promise<void> {
    for (const item of items) {
      await this.deduct(item.productId, item.quantity);
    }
  }

  /**
   * 退款回仓（退货/取消时恢复库存）
   */
  async restore(productId: string, quantity: number): Promise<void> {
    await this.prisma.aceProduct.update({
      where: { id: productId },
      data: { stock: { increment: quantity } },
    });
    this.logger.log(`[Inventory] Restored ${quantity}x stock for ${productId}`);
  }

  /**
   * 批量校验库存（下单前预检）
   */
  async validateStock(items: { productId: string; quantity: number }[]): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const item of items) {
      const product = await this.prisma.aceProduct.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, stock: true, status: true },
      });

      if (!product || product.status !== 'ACTIVE') {
        errors.push(`Product ${item.productId} not available`);
      } else if (product.stock < item.quantity) {
        errors.push(`"${product.name}" only has ${product.stock} in stock (requested ${item.quantity})`);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
