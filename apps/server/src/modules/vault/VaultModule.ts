import { Module } from '@nestjs/common';
import { VaultService } from './VaultService';
import { VaultController } from './VaultController';
import { RiskSentryService } from './RiskSentryService';
import { RiskSentryController } from './RiskSentryController';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VaultController, RiskSentryController],
  providers: [VaultService, RiskSentryService],
  exports: [VaultService, RiskSentryService],
})
export class VaultModule {}
