import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductService } from '../product/ProductService';

/**
 * PaymentFulfillmentService — 支付履约引擎
 *
 * 处理 Xendit 回调 PAID 状态后的完整履约链路：
 * 1. 金额校验（±1% 容差）
 * 2. 幂等检查（已 PAID 订单直接返回）
 * 3. 更新订单状态
 * 4. 库存扣减（乐观锁，最多重试 3 次）
 * 5. 写入 Vault Ledger（收款记帐）
 * 6. 通知下游（WhatsApp 支付成功消息）
 */
@Injectable()
export class PaymentFulfillmentService {
  private readonly logger = new Logger(PaymentFulfillmentService.name);

  /** 金额校验容差：±1% */
  private static readonly AMOUNT_TOLERANCE = 0.01;

  constructor(
    private readonly prisma: PrismaService,
    private readonly productService: ProductService,
  ) {}

  /**
   * 执行支付履约
   *
   * @param externalId 订单 ID（对应 Xendit external_id）
   * @param payload  Xendit 回调 payload（含 id, amount, payment_method, paid_at）
   * @returns 履约结果
   */
  async fulfill(
    externalId: string,
    payload: {
      id: string;
      amount: number;
      payment_method?: string;
      paid_at?: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(
      `[Fulfillment] Starting fulfillment for order ${externalId}, invoice ${payload.id}`,
    );

    // 1. 查询订单（含关联订单项，用于后续库存扣减）
    const order = await this.prisma.aceOrder.findUnique({
      where: { id: externalId },
      include: { items: true },
    });

    if (!order) {
      this.logger.warn(`[Fulfillment] Order not found: ${externalId}`);
      return { success: false, message: 'Order not found' };
    }

    // 2. 幂等检查
    if (order.status === 'PAID') {
      this.logger.log(`[Fulfillment] Order ${externalId} already PAID — idempotent skip`);
      return { success: true, message: 'Already processed' };
    }

    // 3. 金额校验（±1% 容差）
    const orderAmount = Number(order.totalAmount);
    const webhookAmount = Number(payload.amount);
    if (!this.isAmountWithinTolerance(orderAmount, webhookAmount)) {
      this.logger.warn(
        `[Fulfillment] Amount mismatch for ${externalId}: ` +
        `expected=${orderAmount}, received=${webhookAmount}, tolerance=${PaymentFulfillmentService.AMOUNT_TOLERANCE * 100}%`,
      );
      return {
        success: false,
        message: `Amount mismatch: expected ${orderAmount}, received ${webhookAmount}`,
      };
    }

    // 4. 事务内完成订单更新 + 账本写入
    try {
      await this.prisma.$transaction(async (tx) => {
        // 4a. 更新订单状态
        await tx.aceOrder.update({
          where: { id: externalId },
          data: {
            status: 'PAID',
          },
        });

        // 4b. 写入 Vault Ledger（收款记录）
        await tx.aceVaultLedger.create({
          data: {
            orderId: externalId,
            account: 'XENDIT_COLLECTION',
            amount: webhookAmount,
            entryType: 'COLLECTION',
            description: `Xendit payment ${payload.id} via ${payload.payment_method || 'unknown'}`,
          },
        });

        // 4c. 佣金计算（如有 Partner）
        if (order.partnerId) {
          const partner = await tx.acePartner.findUnique({
            where: { id: order.partnerId },
          });
          if (partner) {
            const commission = webhookAmount * Number(partner.commissionRate);
            await tx.aceVaultLedger.create({
              data: {
                orderId: externalId,
                account: 'COMMISSION_PAYABLE',
                amount: -commission,
                entryType: 'COMMISSION',
                description: `Commission for partner ${partner.name}`,
              },
            });
            await tx.acePartner.update({
              where: { id: partner.id },
              data: {
                pendingSettlement: { increment: commission },
              },
            });
          }
        }
      });
    } catch (error: any) {
      this.logger.error(`[Fulfillment] Transaction failed for ${externalId}: ${error.message}`);
      return { success: false, message: `Transaction failed: ${error.message}` };
    }

    // 5. 库存扣减（乐观锁，事务外执行以支持重试）
    if (order.items && Array.isArray(order.items)) {
      for (const item of order.items as Array<{ productId: string; quantity: number }>) {
        const success = await this.productService.decrementStockWithRetry(
          item.productId,
          item.quantity,
        );
        if (!success) {
          this.logger.warn(
            `[Fulfillment] Stock decrement failed for product ${item.productId}, qty=${item.quantity}. ` +
            `Manual intervention may be required for order ${externalId}.`,
          );
        }
      }
    }

    this.logger.log(`[Fulfillment] ✅ Order ${externalId} fulfilled successfully`);
    return { success: true, message: `Order ${externalId} fulfilled` };
  }

  /**
   * 金额校验：检查 webhook 金额与订单金额差异是否在容差范围内
   */
  private isAmountWithinTolerance(orderAmount: number, webhookAmount: number): boolean {
    if (orderAmount === 0 && webhookAmount === 0) return true;
    if (orderAmount === 0) return false;
    const diff = Math.abs(webhookAmount - orderAmount) / orderAmount;
    return diff <= PaymentFulfillmentService.AMOUNT_TOLERANCE;
  }
}
