import { Controller, Get, Req } from '@nestjs/common';
import { DashboardService } from './DashboardService';

@Controller('dashboard')
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
}
