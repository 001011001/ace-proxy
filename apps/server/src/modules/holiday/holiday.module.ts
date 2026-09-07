import { Module } from '@nestjs/common';
import { HolidayController } from '../holiday/HolidayController';
import { HolidayService } from '../holiday/HolidayService';
import { HolidayPredictorService } from '../holiday/HolidayPredictorService';
import { RegionService } from '../region/RegionService';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HolidayController],
  providers: [HolidayService, HolidayPredictorService, RegionService],
  exports: [HolidayService, RegionService],
})
export class HolidayModule {}
