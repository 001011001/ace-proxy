import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════
  //  KPI 总览
  // ═══════════════════════════════════════════

  async getKpis(role?: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalProducts, totalUsers, totalOrders,
      paidOrders, shippedOrders, deliveredOrders,
      cancelledOrders,
    ] = await Promise.all([
      this.prisma.aceProduct.count({ where: { status: 'ACTIVE' } }),
      this.prisma.aceUser.count(),
      this.prisma.aceOrder.count(),
      this.prisma.aceOrder.count({ where: { status: 'PAID' } }),
      this.prisma.aceOrder.count({ where: { status: 'SHIPPED' } }),
      this.prisma.aceOrder.count({ where: { status: 'DELIVERED' } }),
      this.prisma.aceOrder.count({ where: { status: 'CANCELLED' } }),
    ]);

    // ── Real GMV ──
    const gmvResult = await this.prisma.aceOrder.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    });
    const totalGmv = Number(gmvResult._sum.totalAmount || 0);

    const todayGmvResult = await this.prisma.aceOrder.aggregate({
      _sum: { totalAmount: true },
      where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } },
    });
    const todayGmv = Number(todayGmvResult._sum.totalAmount || 0);

    const monthGmvResult = await this.prisma.aceOrder.aggregate({
      _sum: { totalAmount: true },
      where: { createdAt: { gte: thisMonth }, status: { not: 'CANCELLED' } },
    });
    const monthGmv = Number(monthGmvResult._sum.totalAmount || 0);

    // ── Real Profit ──
    const profitResult = await this.prisma.aceOrder.aggregate({
      _sum: { totalAmount: true, sourceCost: true, shippingFee: true, serviceFee: true },
      where: { status: { not: 'CANCELLED' } },
    });
    const totalRevenue = Number(profitResult._sum.totalAmount || 0);
    const totalCost = Number(profitResult._sum.sourceCost || 0);
    const totalShipping = Number(profitResult._sum.shippingFee || 0);
    const totalService = Number(profitResult._sum.serviceFee || 0);
    const totalProfit = totalRevenue - totalCost - totalShipping - totalService;
    const netMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // ── Refund Rate ──
    const refundResult = await this.prisma.aceRefund.aggregate({
      _sum: { amount: true },
    });
    const totalRefund = Number(refundResult._sum.amount || 0);
    const refundRate = totalGmv > 0 ? (totalRefund / totalGmv) * 100 : 0;

    // ── Today orders ──
    const todayOrders = await this.prisma.aceOrder.count({
      where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } },
    });

    // ── Top products ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const topProducts: any[] = await (this.prisma.aceOrderItem as any).groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 5,
    });
    const topProductIds = topProducts.map(p => p.productId);

    const topProductDetails = topProductIds.length > 0
      ? await this.prisma.aceProduct.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, name: true, category: true, priceIdr: true },
        })
      : [];
    const topProductsEnriched = topProducts.map((tp: any) => {
      const detail = topProductDetails.find(d => d.id === tp.productId);
      return {
        productId: tp.productId,
        name: detail?.name || 'Unknown',
        category: detail?.category || 'General',
        orderCount: tp._count?.productId || 0,
        totalQty: tp._sum?.quantity || 0,
      };
    });

    return {
      // GMV
      todayGmv: Math.round(todayGmv),
      monthGmv: Math.round(monthGmv),
      totalGmv: Math.round(totalGmv),
      // Profit
      netMargin: Math.round(netMargin * 10) / 10,
      totalProfit: Math.round(totalProfit),
      totalCost: Math.round(totalCost),
      totalShipping: Math.round(totalShipping),
      totalService: Math.round(totalService),
      // Orders
      totalProducts,
      activeUsers: totalUsers,
      totalOrders,
      todayOrders,
      orderBreakdown: {
        paid: paidOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        pending: totalOrders - paidOrders - shippedOrders - deliveredOrders - cancelledOrders,
      },
      refundRate: Math.round(refundRate * 100) / 100,
      totalRefund: Math.round(totalRefund),
      // Top products
      topProducts: topProductsEnriched,
    };
  }

  // ═══════════════════════════════════════════
  //  趋势
  // ═══════════════════════════════════════════

  async getTrend(days: number) {
    const startDate = new Date(Date.now() - days * 86400000);
    const results: any[] = await this.prisma.$queryRaw`
      SELECT DATE(created_at) as day,
             COUNT(*) as orders,
             COALESCE(SUM(total_amount), 0) as revenue
      FROM ace_orders
      WHERE created_at >= ${startDate}
        AND status != 'CANCELLED'
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `;
    // Fill in missing dates
    const map = new Map<string, any>(results.map((r: any) => [r.day.toISOString().split('T')[0], r]));
    const trend: { date: string; gmv: number; orders: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate.getTime() + i * 86400000).toISOString().split('T')[0];
      const r = map.get(d);
      trend.push({ date: d, gmv: r ? Math.round(Number(r.revenue)) : 0, orders: r ? Number(r.orders) : 0 });
    }
    return trend;
  }

  // ═══════════════════════════════════════════
  //  品类分析
  // ═══════════════════════════════════════════

  async getCategoryBreakdown() {
    // Use database-level aggregation instead of loading all items into memory
    const grouped = await this.prisma.aceOrderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, unitPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 50,
    });

    if (!grouped.length) return [];

    // Fetch product categories for the grouped product IDs
    const productIds = grouped.map((g) => g.productId);
    const products = await this.prisma.aceProduct.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: true },
    });
    const catLookup = new Map(products.map((p) => [p.id, p.category || 'General']));

    // Aggregate by category
    const catMap: Record<string, { orders: number; qty: number; revenue: number }> = {};
    for (const g of grouped) {
      const cat = catLookup.get(g.productId) || 'General';
      if (!catMap[cat]) catMap[cat] = { orders: 0, qty: 0, revenue: 0 };
      catMap[cat].orders += 1;
      catMap[cat].qty += g._sum.quantity || 0;
      catMap[cat].revenue += Number(g._sum.unitPrice || 0) * (g._sum.quantity || 0);
    }

    return Object.entries(catMap)
      .map(([category, data]) => ({
        category,
        orders: data.orders,
        quantity: data.qty,
        revenue: Math.round(data.revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  // ═══════════════════════════════════════════
  //  国家分析
  // ═══════════════════════════════════════════

  async getCountryBreakdown() {
    const result = await this.prisma.aceOrder.groupBy({
      by: ['country'],
      _count: true,
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
      orderBy: { _sum: { totalAmount: 'desc' } },
    });

    return result.map(r => ({
      country: r.country || 'Unknown',
      orders: r._count,
      gmv: Math.round(Number(r._sum.totalAmount || 0)),
    }));
  }
}
