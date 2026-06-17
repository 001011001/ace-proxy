import { Controller, Get } from '@nestjs/common';
import { ProfitDashboardService } from './ProfitDashboardService';

@Controller('dashboard/profit')
export class ProfitDashboardController {
  constructor(private readonly profit: ProfitDashboardService) {}

  @Get('snapshot')
  async getSnapshot() {
    return this.profit.getSnapshot();
  }
}
