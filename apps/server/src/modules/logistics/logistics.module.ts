import { Module } from '@nestjs/common';
import { LogisticsTrackingController } from '../logistics-tracking/LogisticsTrackingController';
import { LogisticsTrackingService } from '../logistics-tracking/LogisticsTrackingService';
import { SmartCollectController } from '../smart-collect/SmartCollectController';
import { SmartCollectService } from '../smart-collect/SmartCollectService';
import { VisionQCService } from '../wms/VisionQCService';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LogisticsTrackingController, SmartCollectController],
  providers: [LogisticsTrackingService, SmartCollectService, VisionQCService],
  exports: [LogisticsTrackingService, SmartCollectService],
})
export class LogisticsModule {}
