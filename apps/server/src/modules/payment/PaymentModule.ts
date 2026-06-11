import { Module } from '@nestjs/common';
import { PaymentService } from './PaymentService';
import { PaymentController } from './PaymentController';

@Module({
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
