import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './DashboardService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpi')
  async getKpis(@Req() req: any) {
    const role = req.user?.role || 'USER';
    return this.dashboardService.getKpis(role);
  }

  @Get('trend')
  async getTrend() {
    return this.dashboardService.getTrend(7);
  }

  @Get('category-breakdown')
  async getCategoryBreakdown() {
    return this.dashboardService.getCategoryBreakdown();
  }

  @Get('country-breakdown')
  async getCountryBreakdown() {
    return this.dashboardService.getCountryBreakdown();
  }

  /** 利润快照：margin + revenue，供 Dashboard Profit Snapshot 卡片使用 */
  @Get('profit/snapshot')
  async getProfitSnapshot(@Req() req: any) {
    const role = req.user?.role || 'USER';
    const kpis = await this.dashboardService.getKpis(role);

    const formatRp = (n: number): string => {
      if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(2)}B`;
      if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1)}M`;
      return `Rp ${n.toLocaleString()}`;
    };

    return {
      margin: `${kpis.netMargin}%`,
      revenue: formatRp(kpis.monthGmv),
      todayGmv: formatRp(kpis.todayGmv),
      totalProfit: formatRp(kpis.totalProfit),
      refundRate: kpis.refundRate,
    };
  }

  /** 资金池摘要：供 Dashboard Pool Balances 卡片使用 */
  @Get('pool/balances')
  async getPoolBalances() {
    const kpis = await this.dashboardService.getKpis();

    const formatRp = (n: number): string => {
      if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1)}M`;
      return `Rp ${n.toLocaleString()}`;
    };

    // 平台利润 = totalProfit
    // 风险池 = 总退款金额的 3 倍作为风险预留
    // 拒付冻结池 = 基于活跃订单数估算
    const riskPool = Math.round(kpis.totalRefund * 3);
    const chargebackLock = kpis.todayOrders > 0
      ? Math.round((kpis.refundRate / 100) * kpis.todayGmv)
      : 0;

    return {
      pools: [
        { pool: 'Platform Profit', balance: formatRp(kpis.totalProfit), status: 'healthy' },
        { pool: 'Risk Pool', balance: formatRp(riskPool), status: riskPool > 50000000 ? 'warning' : 'healthy' },
        { pool: 'Chargeback Lock', balance: formatRp(chargebackLock), status: kpis.refundRate > 3 ? 'warning' : 'healthy' },
      ],
    };
  }
}
