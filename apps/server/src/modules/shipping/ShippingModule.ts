import { Module } from '@nestjs/common';
import { YuntuShippingProvider } from './YuntuShippingProvider';
import { ShippingService } from './ShippingService';
import { MultiCarrierService } from './MultiCarrierService';
import { ShippingController } from './ShippingController';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShippingController],
  providers: [YuntuShippingProvider, ShippingService, MultiCarrierService],
  exports: [ShippingService, MultiCarrierService],
})
export class ShippingModule {}
