import { Controller, Get, Query, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * OrderController — 订单管理后台 API
 */
@Controller('order')
export class OrderController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('list')
  async list(@Query('status') status?: string) {
    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    const [orders, total] = await Promise.all([
      this.prisma.aceOrder.findMany({
        where, orderBy: { createdAt: 'desc' }, take: 100,
        select: { id: true, status: true, totalAmount: true, createdAt: true, userId: true },
      }),
      this.prisma.aceOrder.count({ where }),
    ]);
    return { items: orders, total };
  }

  @Get(':id/timeline')
  async timeline(@Param('id') id: string) {
    const nodes = await this.prisma.aceLogisticsNode.findMany({
      where: { orderId: id }, orderBy: { timestamp: 'asc' },
    });
    const labels: Record<string, string> = {
      CREATED: '已创建', PAID: '已支付', MATCHING: '匹配货源中',
      MATCHED: '已匹配', PURCHASING: '采购中', PURCHASED: '已采购',
      WAREHOUSE_RECEIVED: '已入库', QC_PASSED: '质检通过', QC_FAILED: '质检未通过',
      CONSOLIDATING: '集运中', CONSOLIDATED: '已集运', SHIPPED: '已发货',
      CUSTOMS: '清关中', IN_TRANSIT: '运输中', DELIVERED: '已签收',
    };
    return nodes.map(n => ({ ...n, label: labels[n.node] || n.node, time: n.timestamp.toISOString() }));
  }

  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const orders = await this.prisma.aceOrder.findMany({
      orderBy: { createdAt: 'desc' }, take: 500,
      select: { id: true, userId: true, status: true, totalAmount: true, sourceCost: true, shippingFee: true, serviceFee: true, country: true, createdAt: true },
    });
    const header = '订单号,用户ID,状态,总金额(IDR),采购成本(CNY),运费(CNY),服务费(CNY),国家,创建时间\n';
    const rows = orders.map(o =>
      `${o.id},${o.userId},${o.status},${o.totalAmount},${o.sourceCost||''},${o.shippingFee||''},${o.serviceFee||''},${o.country||''},${o.createdAt.toISOString()}`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(header + rows);
  }
}
