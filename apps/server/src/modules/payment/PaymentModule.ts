import { Module } from '@nestjs/common';
import { PaymentService } from './PaymentService';
import { PaymentController } from './PaymentController';
import { PaymentFulfillmentService } from './PaymentFulfillmentService';
import { WebhookVerifier } from '../../common/WebhookVerifier';
import { ProductService } from '../product/ProductService';

@Module({
  providers: [PaymentService, PaymentFulfillmentService, WebhookVerifier, ProductService],
  controllers: [PaymentController],
  exports: [PaymentService, PaymentFulfillmentService],
})
export class PaymentModule {}
