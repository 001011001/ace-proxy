import { Module } from '@nestjs/common';
import { InventoryService } from './InventoryService';
import { InventoryController } from './InventoryController';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
