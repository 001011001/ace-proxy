import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProfitLossService } from './ProfitLossService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly pnl: ProfitLossService) {}

  @Get('pnl/monthly')
  async monthlyPnL(@Query('year') year?: string, @Query('month') month?: string) {
    const now = new Date();
    const y = year ? parseInt(year) : now.getFullYear();
    const m = month ? parseInt(month) : now.getMonth() + 1;
    return this.pnl.getMonthlyPnL(y, m);
  }

  @Get('pnl/stations')
  async stationsPnL(@Query('year') year?: string, @Query('month') month?: string) {
    const now = new Date();
    const y = year ? parseInt(year) : now.getFullYear();
    const m = month ? parseInt(month) : now.getMonth() + 1;
    return this.pnl.getPnLByStation(y, m);
  }

  @Get('pnl/categories')
  async categoriesPnL(@Query('year') year?: string, @Query('month') month?: string) {
    const now = new Date();
    const y = year ? parseInt(year) : now.getFullYear();
    const m = month ? parseInt(month) : now.getMonth() + 1;
    return this.pnl.getPnLByCategory(y, m);
  }

  @Get('pnl/trend')
  async yearlyTrend(@Query('year') year?: string) {
    const y = year ? parseInt(year) : new Date().getFullYear();
    return this.pnl.getYearlyTrend(y);
  }
}
