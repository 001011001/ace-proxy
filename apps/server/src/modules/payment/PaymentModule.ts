import { Module } from '@nestjs/common';
import { PaymentService } from './PaymentService';
import { PaymentController } from './PaymentController';
import { WebhookVerifier } from '../../common/WebhookVerifier';

@Module({
  providers: [PaymentService, WebhookVerifier],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
