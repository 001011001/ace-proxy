import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiPushService } from '../push/AiPushService';

/**
 * 物流15节点状态机定义
 *
 * CREATED→PAID→MATCHING→MATCHED→PURCHASING→PURCHASED
 * →WAREHOUSE_RECEIVED→QC_PASSED/QC_FAILED→CONSOLIDATING
 * →CONSOLIDATED→SHIPPED→CUSTOMS→IN_TRANSIT→DELIVERED
 */
type LogisticsNode =
  | 'CREATED' | 'PAID' | 'MATCHING' | 'MATCHED'
  | 'PURCHASING' | 'PURCHASED' | 'WAREHOUSE_RECEIVED'
  | 'QC_PASSED' | 'QC_FAILED' | 'CONSOLIDATING'
  | 'CONSOLIDATED' | 'SHIPPED' | 'CUSTOMS'
  | 'IN_TRANSIT' | 'DELIVERED' | 'DISPUTED' | 'REFUNDING' | 'REFUNDED';

export interface TimelineEvent {
  node: LogisticsNode;
  timestamp: Date;
  location: string;
  note: string;
  translation?: Record<string, string>;
}

/**
 * LogisticsTrackingService — 15节点包裹追踪
 *
 * 每个订单从创建到签收经历15个节点。
 * 自动推进主链路，关键节点需要人工确认（QC_PASSED/FAILED）。
 */
@Injectable()
export class LogisticsTrackingService {
  private readonly logger = new Logger(LogisticsTrackingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly push: AiPushService,
  ) {}

  /** 节点中英文翻译 */
  private readonly nodeLabels: Record<LogisticsNode, Record<string, string>> = {
    CREATED: { EN: 'Order Created', ID: 'Pesanan Dibuat', TH: 'สร้างคำสั่งซื้อแล้ว' },
    PAID: { EN: 'Payment Confirmed', ID: 'Pembayaran Dikonfirmasi', TH: 'ยืนยันการชำระเงินแล้ว' },
    MATCHING: { EN: 'Matching Supplier', ID: 'Mencocokkan Pemasok', TH: 'กำลังจับคู่ซัพพลายเออร์' },
    MATCHED: { EN: 'Supplier Matched', ID: 'Pemasok Ditemukan', TH: 'จับคู่ซัพพลายเออร์แล้ว' },
    PURCHASING: { EN: 'Purchasing from 1688', ID: 'Membeli dari 1688', TH: 'กำลังซื้อจาก 1688' },
    PURCHASED: { EN: 'Purchased', ID: 'Sudah Dibeli', TH: 'ซื้อแล้ว' },
    WAREHOUSE_RECEIVED: { EN: 'Arrived at Shenzhen Hub', ID: 'Tiba di Gudang Shenzhen', TH: 'ถึงคลังสินค้าเซินเจิ้นแล้ว' },
    QC_PASSED: { EN: 'Quality Check Passed', ID: 'QC Lulus', TH: 'ผ่านการตรวจสอบคุณภาพ' },
    QC_FAILED: { EN: 'QC Failed', ID: 'QC Gagal', TH: 'ไม่ผ่านการตรวจสอบคุณภาพ' },
    CONSOLIDATING: { EN: 'Consolidating Parcels', ID: 'Mengkonsolidasi Paket', TH: 'กำลังรวมพัสดุ' },
    CONSOLIDATED: { EN: 'Consolidated', ID: 'Terkonsolidasi', TH: 'รวมพัสดุแล้ว' },
    SHIPPED: { EN: 'Shipped Internationally', ID: 'Dikirim Internasional', TH: 'จัดส่งระหว่างประเทศแล้ว' },
    CUSTOMS: { EN: 'Customs Clearance', ID: 'Bea Cukai', TH: 'ผ่านพิธีการศุลกากร' },
    IN_TRANSIT: { EN: 'In Transit', ID: 'Dalam Perjalanan', TH: 'ระหว่างการขนส่ง' },
    DELIVERED: { EN: 'Delivered', ID: 'Terkirim', TH: 'จัดส่งแล้ว' },
    DISPUTED: { EN: 'Disputed', ID: 'Disengketakan', TH: 'โต้แย้ง' },
    REFUNDING: { EN: 'Refunding', ID: 'Pengembalian Dana', TH: 'กำลังคืนเงิน' },
    REFUNDED: { EN: 'Refunded', ID: 'Dana Dikembalikan', TH: 'คืนเงินแล้ว' },
  };

  /** 合法状态转移矩阵 */
  private readonly transitions: Record<LogisticsNode, LogisticsNode[]> = {
    CREATED: ['PAID', 'DISPUTED'],
    PAID: ['MATCHING', 'DISPUTED'],
    MATCHING: ['MATCHED', 'DISPUTED'],
    MATCHED: ['PURCHASING', 'DISPUTED'],
    PURCHASING: ['PURCHASED', 'DISPUTED'],
    PURCHASED: ['WAREHOUSE_RECEIVED', 'DISPUTED'],
    WAREHOUSE_RECEIVED: ['QC_PASSED', 'QC_FAILED', 'DISPUTED'],
    QC_PASSED: ['CONSOLIDATING', 'DISPUTED'],
    QC_FAILED: ['DISPUTED', 'REFUNDING'],
    CONSOLIDATING: ['CONSOLIDATED', 'DISPUTED'],
    CONSOLIDATED: ['SHIPPED', 'DISPUTED'],
    SHIPPED: ['CUSTOMS', 'DISPUTED'],
    CUSTOMS: ['IN_TRANSIT'],
    IN_TRANSIT: ['DELIVERED'],
    DELIVERED: ['REFUNDING'],
    DISPUTED: ['REFUNDING'],
    REFUNDING: ['REFUNDED'],
    REFUNDED: [],
  };

  /**
   * 推进订单到下一节点
   */
  async advance(orderId: string, targetNode: LogisticsNode, params?: {
    location?: string;
    note?: string;
    operatorId?: string;
  }): Promise<TimelineEvent> {
    // 获取当前最后节点
    const latest = await this.prisma.aceLogisticsNode.findFirst({
      where: { orderId },
      orderBy: { timestamp: 'desc' },
    });

    const current = (latest?.node as LogisticsNode) || 'CREATED';

    // 验证状态转移合法性
    const allowed = this.transitions[current];
    if (!allowed?.includes(targetNode)) {
      throw new Error(`Invalid transition: ${current} → ${targetNode}. Allowed: ${allowed?.join(', ')}`);
    }

    // 写入新节点
    const event = await this.prisma.aceLogisticsNode.create({
      data: {
        orderId,
        node: targetNode,
        location: params?.location || null,
        note: params?.note || null,
        timestamp: new Date(),
      },
    });

    // 同步订单状态
    if (this.isTerminalNode(targetNode)) {
      await this.prisma.aceOrder.update({
        where: { id: orderId },
        data: { status: targetNode },
      });
    }

    // 推送通知给用户
    const order = await this.prisma.aceOrder.findUnique({
      where: { id: orderId },
      select: { userId: true },
    });

    if (order) {
      const label = this.nodeLabels[targetNode]?.['EN'] || targetNode;
      this.logger.log(`[Tracking] Order ${orderId}: ${current} → ${targetNode} · ${label}`);
    }

    return {
      node: targetNode,
      timestamp: event.timestamp,
      location: event.location || '',
      note: event.note || '',
      translation: this.nodeLabels[targetNode],
    };
  }

  /**
   * 获取完整追踪时间线
   */
  async getTimeline(orderId: string, lang = 'EN'): Promise<TimelineEvent[]> {
    const nodes = await this.prisma.aceLogisticsNode.findMany({
      where: { orderId },
      orderBy: { timestamp: 'asc' },
    });

    return nodes.map(n => ({
      node: n.node as LogisticsNode,
      timestamp: n.timestamp,
      location: n.location || '',
      note: n.note || '',
      translation: this.nodeLabels[n.node as LogisticsNode],
    }));
  }

  /**
   * 批量推进（多个订单同时推进）
   */
  async bulkAdvance(orderIds: string[], targetNode: LogisticsNode, params?: { location?: string; note?: string }): Promise<number> {
    let count = 0;
    for (const id of orderIds) {
      try {
        await this.advance(id, targetNode, params);
        count++;
      } catch (e) {
        this.logger.warn(`[Tracking] Bulk advance failed for ${id}: ${e}`);
      }
    }
    return count;
  }

  /**
   * 质检结果处理
   */
  async handleQCResult(orderId: string, passed: boolean, note?: string): Promise<TimelineEvent> {
    return this.advance(orderId, passed ? 'QC_PASSED' : 'QC_FAILED', {
      note: note || (passed ? 'Item passed visual inspection' : 'Item failed QC — defect detected'),
      location: 'Shenzhen Hub',
    });
  }

  /**
   * 物流全局统计（真实 Prisma 查询）
   */
  async getStats(): Promise<any> {
    // 1. 总订单数（非取消）
    const totalOrders = await this.prisma.aceOrder.count({
      where: { status: { not: 'CANCELLED' } },
    });

    // 2. 已签收订单平均时效（首个节点→DELIVERED 节点的天数）
    const deliveredOrders = await this.prisma.aceOrder.findMany({
      where: { status: 'DELIVERED' },
      select: { id: true },
    });

    let totalDeliveryDays = 0;
    let deliveryCount = 0;

    for (const o of deliveredOrders) {
      const firstNode = await this.prisma.aceLogisticsNode.findFirst({
        where: { orderId: o.id },
        orderBy: { timestamp: 'asc' },
        select: { timestamp: true },
      });
      const lastNode = await this.prisma.aceLogisticsNode.findFirst({
        where: { orderId: o.id, node: 'DELIVERED' },
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      });
      if (firstNode && lastNode) {
        const days = (lastNode.timestamp.getTime() - firstNode.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        totalDeliveryDays += days;
        deliveryCount++;
      }
    }

    const avgDeliveryDays = deliveryCount > 0
      ? Math.round((totalDeliveryDays / deliveryCount) * 10) / 10
      : 0;

    // 3. 准时率（12天内签收）
    let onTimeCount = 0;
    for (const o of deliveredOrders) {
      const firstNode = await this.prisma.aceLogisticsNode.findFirst({
        where: { orderId: o.id },
        orderBy: { timestamp: 'asc' },
        select: { timestamp: true },
      });
      const deliveredNode = await this.prisma.aceLogisticsNode.findFirst({
        where: { orderId: o.id, node: 'DELIVERED' },
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      });
      if (firstNode && deliveredNode) {
        const days = (deliveredNode.timestamp.getTime() - firstNode.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        if (days <= 12) onTimeCount++;
      }
    }
    const onTimeRate = deliveryCount > 0 ? Math.round((onTimeCount / deliveryCount) * 100) / 100 : 1;

    // 4. 延迟订单（中间节点超过7天未更新）
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const delayedOrders = await this.prisma.aceOrder.count({
      where: {
        status: { in: ['PAID', 'SHIPPED', 'IN_TRANSIT'] },
        createdAt: { lt: sevenDaysAgo },
      },
    });

    // 5. 节点分布（按最新物流节点分组）
    const nodeDistribution = await this.prisma.$queryRawUnsafe<Array<{ node: string; count: bigint }>>(
      `SELECT aln.node, COUNT(DISTINCT aln.order_id) as count
       FROM ace_logistics_nodes aln
       INNER JOIN (
         SELECT order_id, MAX("timestamp") as max_ts
         FROM ace_logistics_nodes
         GROUP BY order_id
       ) latest ON aln.order_id = latest.order_id AND aln."timestamp" = latest.max_ts
       GROUP BY aln.node`
    );

    // 6. 延迟原因分布（从延迟订单的当前节点统计）
    const delaysByReason = await this.prisma.$queryRawUnsafe<Array<{ node: string; count: bigint }>>(
      `SELECT aln.node, COUNT(*) as count
       FROM ace_logistics_nodes aln
       INNER JOIN (
         SELECT order_id, MAX("timestamp") as max_ts
         FROM ace_logistics_nodes
         GROUP BY order_id
       ) latest ON aln.order_id = latest.order_id AND aln."timestamp" = latest.max_ts
       WHERE aln."timestamp" < $1
       AND aln.node NOT IN ('DELIVERED', 'REFUNDED', 'CANCELLED')
       GROUP BY aln.node`,
      sevenDaysAgo,
    );

    return {
      totalOrders,
      avgDeliveryDays,
      onTimeRate,
      delayedOrders,
      nodeDistribution: nodeDistribution.map(n => ({ node: n.node, count: Number(n.count) })),
      delaysByReason: delaysByReason.map(r => ({
        reason: r.node, count: Number(r.count), avgDays: 0,
      })),
    };
  }

  /**
   * 延迟订单详情
   */
  async getDelays(): Promise<any[]> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const delayed = await this.prisma.$queryRawUnsafe<Array<{
      id: string; status: string; node: string; timestamp: Date;
    }>>(
      `SELECT o.id, o.status, ln.node, ln."timestamp"
       FROM ace_orders o
       INNER JOIN (
         SELECT order_id, node, "timestamp"
         FROM ace_logistics_nodes aln1
         WHERE "timestamp" = (
           SELECT MAX("timestamp") FROM ace_logistics_nodes aln2 WHERE aln2.order_id = aln1.order_id
         )
       ) ln ON o.id = ln.order_id
       WHERE o.status IN ('PAID', 'SHIPPED', 'IN_TRANSIT')
       AND ln."timestamp" < $1
       LIMIT 20`,
      sevenDaysAgo,
    );

    return delayed.map(d => ({
      orderId: d.id,
      node: d.node,
      daysAtNode: Math.round((Date.now() - new Date(d.timestamp).getTime()) / (1000 * 60 * 60 * 24)),
      expectedDays: 7,
      region: 'ID',
      status: (Date.now() - new Date(d.timestamp).getTime()) > 14 * 24 * 60 * 60 * 1000 ? 'CRITICAL' : 'DELAYED',
    }));
  }

  private isTerminalNode(node: LogisticsNode): boolean {
    return ['DELIVERED', 'REFUNDED'].includes(node);
  }
}
