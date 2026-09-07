import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type InboundStatus = 'PENDING' | 'RECEIVING' | 'QC_CHECK' | 'PUT_AWAY' | 'COMPLETED';
export type OutboundStatus = 'PENDING' | 'PICKING' | 'PACKED' | 'SHIPPED' | 'DELIVERED';

@Injectable()
export class WarehouseService {
  private readonly logger = new Logger(WarehouseService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── 仓库管理 ───

  /** 仓库列表 */
  async listWarehouses(country?: string) {
    const where: any = {};
    if (country) where.country = country;
    return this.prisma.aceWarehouse.findMany({
      where,
      include: { locations: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** 创建仓库 */
  async createWarehouse(data: { name: string; country: string; address?: string }) {
    return this.prisma.aceWarehouse.create({ data });
  }

  /** 仓库详情 */
  async getWarehouse(id: string) {
    const w = await this.prisma.aceWarehouse.findUnique({
      where: { id },
      include: { locations: true },
    });
    if (!w) throw new NotFoundException(`Warehouse ${id} not found`);
    return w;
  }

  // ─── 库位管理 ───

  /** 库位列表 */
  async listLocations(warehouseId: string) {
    return this.prisma.aceWarehouseLocation.findMany({
      where: { warehouseId },
      orderBy: { label: 'asc' },
    });
  }

  /** 创建库位 */
  async createLocation(data: { warehouseId: string; label: string; type?: string; capacity?: number }) {
    return this.prisma.aceWarehouseLocation.create({
      data: {
        warehouseId: data.warehouseId,
        label: data.label,
        type: data.type || 'SHELF',
        capacity: data.capacity || 100,
      },
    });
  }

  /** 更新库位状态 */
  async updateLocation(id: string, data: { status?: string; usedCount?: number }) {
    return this.prisma.aceWarehouseLocation.update({ where: { id }, data });
  }

  // ─── 入库管理 ───

  /** 创建入库单 */
  async createInbound(data: {
    warehouseId: string;
    purchaseOrderId?: string;
    supplierId?: string;
    trackingNumber?: string;
    totalItems: number;
    notes?: string;
  }) {
    return this.prisma.aceInboundOrder.create({ data });
  }

  /** 入库单列表 */
  async listInbounds(params: { warehouseId?: string; status?: string; page?: number; pageSize?: number }) {
    const { warehouseId, status, page = 1, pageSize = 20 } = params;
    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.aceInboundOrder.findMany({
        where,
        include: { warehouse: true, purchaseOrder: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.aceInboundOrder.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  /** 入库单详情 */
  async getInbound(id: string) {
    const inbound = await this.prisma.aceInboundOrder.findUnique({
      where: { id },
      include: { warehouse: true, purchaseOrder: true },
    });
    if (!inbound) throw new NotFoundException(`Inbound order ${id} not found`);
    return inbound;
  }

  /** 更新入库单状态 */
  async updateInboundStatus(id: string, status: InboundStatus, data?: { receivedItems?: number; notes?: string }) {
    const updateData: any = { status };
    if (data?.receivedItems) updateData.receivedItems = data.receivedItems;
    if (data?.notes) updateData.notes = data.notes;

    if (status === 'RECEIVING') updateData.receivedAt = new Date();
    if (status === 'COMPLETED') updateData.completedAt = new Date();

    const inbound = await this.prisma.aceInboundOrder.update({
      where: { id },
      data: updateData,
      include: { warehouse: true, purchaseOrder: true },
    });

    this.logger.log(`[WMS] Inbound ${id}: → ${status}`);
    return inbound;
  }

  /** 入库完成 → 更新库位存量 + 采购单状态 */
  async completeInbound(id: string, locationId?: string) {
    const inbound = await this.getInbound(id);

    // 更新入库单状态
    await this.prisma.aceInboundOrder.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        receivedItems: inbound.totalItems,
        completedAt: new Date(),
      },
    });

    // 如果指定了库位，更新库位存量
    if (locationId) {
      await this.prisma.aceWarehouseLocation.update({
        where: { id: locationId },
        data: { usedCount: { increment: inbound.totalItems } },
      });
    }

    // 关联采购单自动收货
    if (inbound.purchaseOrderId) {
      await this.prisma.acePurchaseOrder.update({
        where: { id: inbound.purchaseOrderId },
        data: { status: 'RECEIVED' },
      });
    }

    this.logger.log(`[WMS] Inbound ${id} completed, ${inbound.totalItems} items received`);
    return { success: true, inboundId: id };
  }

  // ─── 出库管理 ───

  /** 创建出库单 */
  async createOutbound(data: {
    warehouseId: string;
    orderId?: string;
    consolidationOrderId?: string;
    destination?: string;
    totalItems: number;
    notes?: string;
  }) {
    return this.prisma.aceOutboundOrder.create({ data });
  }

  /** 出库单列表 */
  async listOutbounds(params: { warehouseId?: string; status?: string; page?: number; pageSize?: number }) {
    const { warehouseId, status, page = 1, pageSize = 20 } = params;
    const where: any = {};
    if (warehouseId) where.warehouseId = warehouseId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.aceOutboundOrder.findMany({
        where,
        include: { warehouse: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.aceOutboundOrder.count({ where }),
    ]);

    return { data, total, page, pageSize };
  }

  /** 出库单详情 */
  async getOutbound(id: string) {
    const outbound = await this.prisma.aceOutboundOrder.findUnique({
      where: { id },
      include: { warehouse: true },
    });
    if (!outbound) throw new NotFoundException(`Outbound order ${id} not found`);
    return outbound;
  }

  /** 更新出库单状态 */
  async updateOutboundStatus(
    id: string,
    status: OutboundStatus,
    data?: { pickedItems?: number; trackingNumber?: string; shippingProvider?: string; notes?: string },
  ) {
    const updateData: any = { status };
    if (data?.pickedItems) updateData.pickedItems = data.pickedItems;
    if (data?.trackingNumber) updateData.trackingNumber = data.trackingNumber;
    if (data?.shippingProvider) updateData.shippingProvider = data.shippingProvider;
    if (data?.notes) updateData.notes = data.notes;

    if (status === 'SHIPPED') updateData.shippedAt = new Date();
    if (status === 'DELIVERED') updateData.deliveredAt = new Date();

    const outbound = await this.prisma.aceOutboundOrder.update({
      where: { id },
      data: updateData,
      include: { warehouse: true },
    });

    this.logger.log(`[WMS] Outbound ${id}: → ${status}`);
    return outbound;
  }

  /** 获取仓库概览统计 */
  async getWarehouseStats(warehouseId: string) {
    const [inbound, outbound, locations] = await Promise.all([
      this.prisma.aceInboundOrder.count({ where: { warehouseId, status: { in: ['PENDING', 'RECEIVING', 'QC_CHECK'] } } }),
      this.prisma.aceOutboundOrder.count({ where: { warehouseId, status: { in: ['PENDING', 'PICKING'] } } }),
      this.prisma.aceWarehouseLocation.aggregate({
        where: { warehouseId },
        _sum: { capacity: true, usedCount: true },
        _count: true,
      }),
    ]);

    return {
      warehouseId,
      pendingInbound: inbound,
      pendingOutbound: outbound,
      totalLocations: locations._count,
      totalCapacity: locations._sum.capacity || 0,
      totalUsed: locations._sum.usedCount || 0,
      utilizationRate: locations._sum.capacity
        ? ((locations._sum.usedCount || 0) / locations._sum.capacity * 100).toFixed(1)
        : '0',
    };
  }
}
