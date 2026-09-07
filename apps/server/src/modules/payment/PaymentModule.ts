import { Module } from '@nestjs/common';
import { PaymentService } from './PaymentService';
import { PaymentController } from './PaymentController';
import { PaymentFulfillmentService } from './PaymentFulfillmentService';
import { WebhookVerifier } from '../../common/WebhookVerifier';
import { ProductService } from '../product/ProductService';
import { InventoryService } from '../inventory/InventoryService';
import { ComplianceService } from '../compliance/ComplianceService';
import { LogisticsTrackingService } from '../logistics-tracking/LogisticsTrackingService';
import { NotificationService } from '../notification/NotificationService';
import { AiPushService } from '../push/AiPushService';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    PaymentService, PaymentFulfillmentService, WebhookVerifier,
    ProductService, InventoryService, ComplianceService,
    LogisticsTrackingService, NotificationService, AiPushService,
  ],
  controllers: [PaymentController],
  exports: [PaymentService, PaymentFulfillmentService],
})
export class PaymentModule {}
