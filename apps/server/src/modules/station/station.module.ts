import { Module } from '@nestjs/common';
import { StationController } from './StationController';
import { StationAdminController } from './StationAdminController';
import { StationService } from './StationService';
import { StationAdminService } from './StationAdminService';
import { ProductService } from '../product/ProductService';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StationController, StationAdminController],
  providers: [StationService, StationAdminService, ProductService],
  exports: [StationService, StationAdminService],
})
export class StationModule {}
