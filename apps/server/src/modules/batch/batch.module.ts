import { Module } from '@nestjs/common';
import { BatchOperationService } from './BatchOperationService';
import { BatchOperationController } from './BatchOperationController';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BatchOperationController],
  providers: [BatchOperationService],
  exports: [BatchOperationService],
})
export class BatchModule {}
