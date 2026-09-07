import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface BatchResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

@Injectable()
export class BatchOperationService {
  private readonly logger = new Logger(BatchOperationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** 批量更新订单状态 */
  async batchUpdateOrderStatus(ids: string[], status: string): Promise<BatchResult> {
    const result: BatchResult = { total: ids.length, success: 0, failed: 0, errors: [] };
    for (const id of ids) {
      try {
        await this.prisma.aceOrder.update({ where: { id }, data: { status } });
        result.success++;
      } catch (e: any) {
        result.failed++;
        result.errors.push(`${id}: ${e.message}`);
      }
    }
    this.logger.log(`[Batch] Orders: ${result.success}/${result.total} → ${status}`);
    return result;
  }

  /** 批量更新物流节点 */
  async batchAdvanceLogistics(orderIds: string[], node: string, location?: string) {
    const result: BatchResult = { total: orderIds.length, success: 0, failed: 0, errors: [] };
    for (const id of orderIds) {
      try {
        await this.prisma.aceLogisticsNode.create({
          data: { orderId: id, node, timestamp: new Date(), location: location || null },
        });
        result.success++;
      } catch (e: any) {
        result.failed++;
        result.errors.push(`${id}: ${e.message}`);
      }
    }
    return result;
  }

  /** 批量更新采购单状态 */
  async batchUpdatePOStatus(ids: string[], status: string): Promise<BatchResult> {
    const result: BatchResult = { total: ids.length, success: 0, failed: 0, errors: [] };
    for (const id of ids) {
      try {
        await this.prisma.acePurchaseOrder.update({ where: { id }, data: { status } });
        result.success++;
      } catch (e: any) {
        result.failed++;
        result.errors.push(`${id}: ${e.message}`);
      }
    }
    return result;
  }

  /** 批量更新入库单状态 */
  async batchUpdateInboundStatus(ids: string[], status: string): Promise<BatchResult> {
    const result: BatchResult = { total: ids.length, success: 0, failed: 0, errors: [] };
    for (const id of ids) {
      try {
        await this.prisma.aceInboundOrder.update({ where: { id }, data: { status } });
        result.success++;
      } catch (e: any) {
        result.failed++;
        result.errors.push(`${id}: ${e.message}`);
      }
    }
    return result;
  }

  /** 批量更新出库单状态 */
  async batchUpdateOutboundStatus(ids: string[], status: string): Promise<BatchResult> {
    const result: BatchResult = { total: ids.length, success: 0, failed: 0, errors: [] };
    for (const id of ids) {
      try {
        await this.prisma.aceOutboundOrder.update({ where: { id }, data: { status } });
        result.success++;
      } catch (e: any) {
        result.failed++;
        result.errors.push(`${id}: ${e.message}`);
      }
    }
    return result;
  }

  /** 批量删除/下架产品 */
  async batchUpdateProductStatus(ids: string[], status: string): Promise<BatchResult> {
    const result: BatchResult = { total: ids.length, success: 0, failed: 0, errors: [] };
    for (const id of ids) {
      try {
        await this.prisma.aceProduct.update({ where: { id }, data: { status } });
        result.success++;
      } catch (e: any) {
        result.failed++;
        result.errors.push(`${id}: ${e.message}`);
      }
    }
    return result;
  }
}
