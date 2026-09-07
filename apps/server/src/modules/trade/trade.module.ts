import { Module, forwardRef } from '@nestjs/common';
import { TradeController } from './TradeController';
import { TradeService } from './TradeService';
import { PrismaModule } from '../../prisma/prisma.module';
import { PurchaseOrderModule } from '../purchase-order/purchase-order.module';

@Module({
  imports: [PrismaModule, forwardRef(() => PurchaseOrderModule)],
  controllers: [TradeController],
  providers: [TradeService],
  exports: [TradeService],
})
export class TradeModule {}
