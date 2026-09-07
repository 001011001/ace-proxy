import { Module } from '@nestjs/common';
import { VisionQCService } from './VisionQCService';
import { WarehouseService } from './WarehouseService';
import { WmsController } from './WmsController';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WmsController],
  providers: [VisionQCService, WarehouseService],
  exports: [VisionQCService, WarehouseService],
})
export class WmsModule {}
