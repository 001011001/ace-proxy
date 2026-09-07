import { Module } from '@nestjs/common';
import { OrderController } from './OrderController';
import { OrderLifecycleController } from './OrderLifecycleController';
import { OrderLifecycleService } from './OrderLifecycleService';
import { LogisticsTrackingService } from '../logistics-tracking/LogisticsTrackingService';
import { InventoryService } from '../inventory/InventoryService';
import { NotificationService } from '../notification/NotificationService';
import { ComplianceService } from '../compliance/ComplianceService';
import { AiPushService } from '../push/AiPushService';
import { PrismaModule } from '../../prisma/prisma.module';
import { WmsModule } from '../wms/wms.module';

@Module({
  imports: [PrismaModule, WmsModule],
  controllers: [OrderController, OrderLifecycleController],
  providers: [
    OrderLifecycleService,
    LogisticsTrackingService,
    InventoryService,
    NotificationService,
    ComplianceService,
    AiPushService,
  ],
  exports: [OrderLifecycleService],
})
export class OrderModule {}
