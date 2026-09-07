import { Module } from '@nestjs/common';
import { DashboardController } from '../dashboard/DashboardController';
import { DashboardService } from '../dashboard/DashboardService';
import { UserAnalyticsController } from '../user-analytics/UserAnalyticsController';
import { UserAnalyticsService } from '../user-analytics/UserAnalyticsService';
import { CronService } from '../cron/CronService';
import { InventoryService } from '../inventory/InventoryService';
import { HealthController } from '../health/HealthController';
import { SupplierScoreService } from '../supplier/SupplierScoreService';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController, UserAnalyticsController, HealthController],
  providers: [DashboardService, UserAnalyticsService, CronService, InventoryService, SupplierScoreService],
  exports: [DashboardService],
})
export class AnalyticsModule {}
