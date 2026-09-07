import { Module } from '@nestjs/common';
import { ProfitLossService } from './ProfitLossService';
import { FinanceController } from './FinanceController';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FinanceController],
  providers: [ProfitLossService],
  exports: [ProfitLossService],
})
export class FinanceModule {}
