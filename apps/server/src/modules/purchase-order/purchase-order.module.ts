import { Module } from '@nestjs/common';
import { PurchaseOrderService } from './PurchaseOrderService';
import { PurchaseOrderController } from './PurchaseOrderController';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseOrderModule {}
