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

  private isTerminalNode(node: LogisticsNode): boolean {
    return ['DELIVERED', 'REFUNDED'].includes(node);
  }
}
