import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type POStatus = 'DRAFT' | 'SUBMITTED' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';
export type POItemStatus = 'PENDING' | 'ORDERED' | 'RECEIVED';

const VALID_TRANSITIONS: Record<POStatus, POStatus[]> = {
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['RECEIVED', 'CANCELLED'],
  RECEIVED: [],
  CANCELLED: [],
};

@Injectable()
export class PurchaseOrderService {
  private readonly logger = new Logger(PurchaseOrderService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** 创建采购单 */
  async create(data: {
    orderId?: string;
    supplierId?: string;
    notes?: string;
    items: { productId?: string; sourceUrl?: string; productName: string; quantity: number; unitCostCny?: number }[];
  }) {
    const totalCost = data.items.reduce((sum, i) => sum + (i.unitCostCny || 0) * i.quantity, 0);

    const po = await this.prisma.acePurchaseOrder.create({
      data: {
        orderId: data.orderId || null,
        supplierId: data.supplierId || null,
        status: 'DRAFT',
        totalCostCny: totalCost,
        notes: data.notes,
        items: {
          create: data.items.map(item => ({
            productId: item.productId || null,
            sourceUrl: item.sourceUrl || null,
            productName: item.productName,
            quantity: item.quantity,
            unitCostCny: item.unitCostCny || 0,
            status: 'PENDING',
          })),
        },
      },
      include: { items: true, supplier: true },
    });

    this.logger.log(`[PO] Created ${po.id}: ${data.items.length} items, ¥${totalCost}`);
    return po;
  }

  /** 获取采购单列表 */
  async findAll(params: { status?: string; supplierId?: string; page?: number; pageSize?: number }) {
    const { status, supplierId, page = 1, pageSize = 20 } = params;
    const where: any = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;

    const [data, total] = await Promise.all([
      this.prisma.acePurchaseOrder.findMany({
        where,
        include: { items: true, supplier: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.acePurchaseOrder.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  /** 获取单个采购单 */
  async findOne(id: string) {
    const po = await this.prisma.acePurchaseOrder.findUnique({
      where: { id },
      include: { items: true, supplier: true, inboundOrders: true },
    });
    if (!po) throw new NotFoundException(`Purchase order ${id} not found`);
    return po;
  }

  /** 更新采购单状态 */
  async updateStatus(id: string, newStatus: POStatus) {
    const po = await this.findOne(id);
    const currentStatus = po.status as POStatus;

    if (!VALID_TRANSITIONS[currentStatus]?.includes(newStatus)) {
      throw new Error(`Invalid transition: ${currentStatus} → ${newStatus}`);
    }

    const updateData: any = { status: newStatus };
    if (newStatus === 'RECEIVED') {
      // 当采购单收货后，自动更新所有采购项为已收货
      await this.prisma.acePurchaseOrderItem.updateMany({
        where: { purchaseOrderId: id },
        data: { status: 'RECEIVED' },
      });
    }

    const updated = await this.prisma.acePurchaseOrder.update({
      where: { id },
      data: updateData,
      include: { items: true, supplier: true },
    });

    this.logger.log(`[PO] ${id}: ${currentStatus} → ${newStatus}`);
    return updated;
  }

  /** 更新采购单项状态 */
  async updateItemStatus(poId: string, itemId: string, status: POItemStatus) {
    await this.findOne(poId);
    return this.prisma.acePurchaseOrderItem.update({
      where: { id: itemId },
      data: { status },
    });
  }

  /** 更新采购单信息 */
  async update(id: string, data: { supplierId?: string; notes?: string; totalCostCny?: number }) {
    await this.findOne(id);
    return this.prisma.acePurchaseOrder.update({
      where: { id },
      data,
      include: { items: true, supplier: true },
    });
  }

  /**
   * 管理员履行采购单：填写1688订单号、运单号，推进状态
   * 这是代付链路的关键操作 — 管理员在1688下单后填写信息
   */
  async fulfill(
    id: string,
    data: {
      sourceUrl?: string;
      trackingNumber?: string;
      notes?: string;
      newStatus?: POStatus;
      totalCostCny?: number;
    },
  ) {
    const po = await this.findOne(id);

    const updateData: any = {};
    if (data.sourceUrl !== undefined) updateData.sourceUrl = data.sourceUrl;
    if (data.trackingNumber !== undefined) updateData.trackingNumber = data.trackingNumber;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.totalCostCny !== undefined) updateData.totalCostCny = data.totalCostCny;

    if (Object.keys(updateData).length > 0) {
      await this.prisma.acePurchaseOrder.update({
        where: { id },
        data: updateData,
      });
    }

    // 如果指定了新状态，则推进状态
    if (data.newStatus && data.newStatus !== po.status) {
      await this.updateStatus(id, data.newStatus);

      // 如果采购单推进到 IN_TRANSIT，同时更新订单状态
      if (data.newStatus === 'IN_TRANSIT' && po.orderId) {
        await this.prisma.aceOrder.update({
          where: { id: po.orderId },
          data: { status: 'PURCHASING' },
        });
      }

      // 如果采购单收货，更新订单状态
      if (data.newStatus === 'RECEIVED' && po.orderId) {
        await this.prisma.aceOrder.update({
          where: { id: po.orderId },
          data: { status: 'IN_WAREHOUSE_CN' },
        });
      }
    }

    this.logger.log(`[PO] Fulfilled ${id}: ${JSON.stringify(data)}`);
    return this.findOne(id);
  }

  /** 从订单创建采购单（订单 MATCHED 后自动调用） */
  async createFromOrder(orderId: string) {
    // 查找订单已有的物品
    const order = await this.prisma.aceOrder.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    const items = order.items.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitCostCny: Number(item.product.costCny || 0),
    }));

    if (items.length === 0) {
      this.logger.warn(`[PO] Order ${orderId} has no items, skipping PO creation`);
      return null;
    }

    const po = await this.create({ orderId, items });
    await this.updateStatus(po.id, 'SUBMITTED');

    // 更新订单状态
    await this.prisma.aceOrder.update({
      where: { id: orderId },
      data: { status: 'MATCHED' },
    });

    return po;
  }
}
