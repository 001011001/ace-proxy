import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface PnLSummary {
  totalRevenue: number;
  totalCost: number;
  totalShipping: number;
  totalServiceFee: number;
  totalCommission: number;
  totalRefund: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
}

@Injectable()
export class ProfitLossService {
  constructor(private readonly prisma: PrismaService) {}

  /** 月度损益表 */
  async getMonthlyPnL(year: number, month: number): Promise<PnLSummary & { month: string }> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const where = { createdAt: { gte: start, lt: end }, status: { not: 'CANCELLED' } };

    const [agg, refundAgg] = await Promise.all([
      this.prisma.aceOrder.aggregate({
        _sum: { totalAmount: true, sourceCost: true, shippingFee: true, serviceFee: true, commissionAmount: true },
        where,
      }),
      this.prisma.aceRefund.aggregate({
        _sum: { amount: true },
        where: { createdAt: { gte: start, lt: end } },
      }),
    ]);

    const revenue = Number(agg._sum.totalAmount || 0);
    const cost = Number(agg._sum.sourceCost || 0);
    const shipping = Number(agg._sum.shippingFee || 0);
    const service = Number(agg._sum.serviceFee || 0);
    const commission = Number(agg._sum.commissionAmount || 0);
    const refund = Number(refundAgg._sum.amount || 0);
    const grossProfit = revenue - cost;
    const netProfit = revenue - cost - shipping - service - commission - refund;

    return {
      month: `${year}-${String(month).padStart(2, '0')}`,
      totalRevenue: Math.round(revenue),
      totalCost: Math.round(cost),
      totalShipping: Math.round(shipping),
      totalServiceFee: Math.round(service),
      totalCommission: Math.round(commission),
      totalRefund: Math.round(refund),
      grossProfit: Math.round(grossProfit),
      netProfit: Math.round(netProfit),
      grossMargin: revenue > 0 ? Math.round((grossProfit / revenue) * 1000) / 10 : 0,
      netMargin: revenue > 0 ? Math.round((netProfit / revenue) * 1000) / 10 : 0,
    };
  }

  /** 分站损益 */
  async getPnLByStation(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const orders = await this.prisma.aceOrder.findMany({
      where: { createdAt: { gte: start, lt: end }, status: { not: 'CANCELLED' }, country: { not: null } },
      select: { country: true, totalAmount: true, sourceCost: true, shippingFee: true, serviceFee: true, commissionAmount: true },
    });

    const grouped: Record<string, { revenue: number; cost: number; shipping: number; service: number; commission: number; count: number }> = {};
    for (const o of orders) {
      const c = o.country || 'Unknown';
      if (!grouped[c]) grouped[c] = { revenue: 0, cost: 0, shipping: 0, service: 0, commission: 0, count: 0 };
      grouped[c].revenue += Number(o.totalAmount);
      grouped[c].cost += Number(o.sourceCost || 0);
      grouped[c].shipping += Number(o.shippingFee || 0);
      grouped[c].service += Number(o.serviceFee || 0);
      grouped[c].commission += Number(o.commissionAmount || 0);
      grouped[c].count++;
    }

    return Object.entries(grouped).map(([station, d]) => ({
      station,
      revenue: Math.round(d.revenue),
      cost: Math.round(d.cost),
      grossProfit: Math.round(d.revenue - d.cost),
      netProfit: Math.round(d.revenue - d.cost - d.shipping - d.service - d.commission),
      orders: d.count,
    })).sort((a, b) => b.revenue - a.revenue);
  }

  /** 近12个月趋势 */
  async getYearlyTrend(year: number) {
    const results = [];
    for (let m = 1; m <= 12; m++) {
      const pnl = await this.getMonthlyPnL(year, m);
      results.push(pnl);
    }
    return results;
  }

  /** 分品类损益 */
  async getPnLByCategory(year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const items = await this.prisma.aceOrderItem.findMany({
      where: {
        order: { createdAt: { gte: start, lt: end }, status: { not: 'CANCELLED' } },
      },
      include: {
        product: { select: { category: true } },
        order: { select: { totalAmount: true, sourceCost: true } },
      },
    });

    const grouped: Record<string, { revenue: number; cost: number; count: number }> = {};
    for (const item of items) {
      const cat = item.product?.category || 'General';
      if (!grouped[cat]) grouped[cat] = { revenue: 0, cost: 0, count: 0 };
      grouped[cat].revenue += Number(item.unitPrice) * item.quantity;
      grouped[cat].cost += Number(item.order.sourceCost || 0) / (item.order as any)?.items?.length || 0;
      grouped[cat].count += item.quantity;
    }

    return Object.entries(grouped)
      .map(([category, d]) => ({
        category,
        revenue: Math.round(d.revenue),
        cost: Math.round(d.cost),
        grossProfit: Math.round(d.revenue - d.cost),
        quantity: d.count,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }
}
