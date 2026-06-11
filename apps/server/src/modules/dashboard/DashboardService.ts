import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKpis(role?: string) {
    const kpis: any = {};

    // 今日GMV
    const today = new Date(); today.setHours(0,0,0,0);
    const gmvResult = await this.prisma.$queryRawUnsafe(
      `SELECT COALESCE(SUM(total_amount),0) as val FROM ace_orders WHERE status != 'CANCELLED' AND created_at >= ?`,
      today.toISOString()
    );
    kpis.todayGmv = Number((gmvResult as any)[0]?.val || 0);

    // 净利率 (savings ratio)
    const marginResult = await this.prisma.$queryRawUnsafe(
      `SELECT COALESCE(AVG((total_amount - COALESCE(source_cost,0) - COALESCE(shipping_fee,0) - COALESCE(service_fee,0)) / NULLIF(total_amount,0)),0) as val FROM ace_orders WHERE status NOT IN ('CANCELLED','PENDING')`
    );
    kpis.netMargin = Math.round(Number((marginResult as any)[0]?.val || 0) * 10000) / 100;

    // 活跃用户
    const userResult = await this.prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as val FROM ace_users`
    );
    kpis.activeUsers = Number((userResult as any)[0]?.val || 0);

    // 产品数
    const prodResult = await this.prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as val FROM ace_products WHERE status='ACTIVE'`
    );
    kpis.totalProducts = Number((prodResult as any)[0]?.val || 0);

    // 订单总数 + 各状态分布
    const orderResult = await this.prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as total, 
        SUM(CASE WHEN status='PAID' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN status='SHIPPED' THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN status='DELIVERED' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status='PENDING' THEN 1 ELSE 0 END) as pending
      FROM ace_orders WHERE status != 'CANCELLED'`
    );
    const o = (orderResult as any)[0];
    kpis.totalOrders = Number(o.total || 0);
    kpis.orderBreakdown = {
      paid: Number(o.paid || 0),
      shipped: Number(o.shipped || 0),
      delivered: Number(o.delivered || 0),
      pending: Number(o.pending || 0),
    };

    // 退款率
    const refundResult = await this.prisma.$queryRawUnsafe(
      `SELECT COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM ace_orders), 0) as val FROM ace_refunds WHERE status='APPROVED'`
    );
    kpis.refundRate = Math.round(Number((refundResult as any)[0]?.val || 0) * 100) / 100;

    return kpis;
  }

  async getTrend(days: number) {
    const results = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const start = new Date(d); start.setHours(0,0,0,0);
      const end = new Date(d); end.setHours(23,59,59,999);
      const r = await this.prisma.$queryRawUnsafe(
        `SELECT COALESCE(SUM(total_amount),0) as val, COUNT(*) as cnt FROM ace_orders WHERE status != 'CANCELLED' AND created_at >= ? AND created_at <= ?`,
        start.toISOString(), end.toISOString()
      );
      results.push({
        date: d.toISOString().split('T')[0],
        gmv: Number((r as any)[0]?.val || 0),
        orders: Number((r as any)[0]?.cnt || 0),
      });
    }
    return results;
  }
}
