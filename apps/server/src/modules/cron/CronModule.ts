import { Module } from '@nestjs/common';
import { CronService } from './CronService';
import { ReconciliationCronService } from './ReconciliationCronService';
import { AIPushCronService } from './AIPushCronService';
import { CronController } from './CronController';
import { AiPushService } from '../push/AiPushService';
import { NotificationService } from '../notification/NotificationService';
import { PrismaModule } from '../../prisma/prisma.module';
import { VaultModule } from '../vault/VaultModule';

@Module({
  imports: [PrismaModule, VaultModule],
  controllers: [CronController],
  providers: [
    CronService, ReconciliationCronService, AIPushCronService,
    AiPushService, NotificationService,
  ],
  exports: [ReconciliationCronService, AIPushCronService],
})
export class CronModule {}
