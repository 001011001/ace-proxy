import { Module } from '@nestjs/common';
import { NotificationService } from './NotificationService';
import { PushChannelsService } from './PushChannelsService';
import { NotificationController } from './NotificationController';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationService, PushChannelsService],
  exports: [NotificationService, PushChannelsService],
})
export class NotificationModule {}
