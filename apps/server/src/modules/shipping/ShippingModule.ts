import { Module } from '@nestjs/common';
import { YuntuShippingProvider } from './YuntuShippingProvider';
import { ShippingService } from './ShippingService';
import { ShippingController } from './ShippingController';

@Module({
  controllers: [ShippingController],
  providers: [YuntuShippingProvider, ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
