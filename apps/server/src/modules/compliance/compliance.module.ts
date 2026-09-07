import { Module } from '@nestjs/common';
import { ComplianceService } from './ComplianceService';
import { ComplianceController } from './ComplianceController';

@Module({
  controllers: [ComplianceController],
  providers: [ComplianceService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
