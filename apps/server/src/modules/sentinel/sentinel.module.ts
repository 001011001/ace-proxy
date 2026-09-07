import { Module } from '@nestjs/common';
import { IPFirewallService } from './IPFirewallService';
import { SentinelController } from './SentinelController';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SentinelController],
  providers: [IPFirewallService],
  exports: [IPFirewallService],
})
export class SentinelModule {}
