import { Module } from '@nestjs/common';
import { SupplierScoreService } from './SupplierScoreService';
import { SupplierController } from './SupplierController';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SupplierController],
  providers: [SupplierScoreService],
  exports: [SupplierScoreService],
})
export class SupplierModule {}
