import { Module } from '@nestjs/common';
import { ReferralService } from './ReferralService';
import { ReferralController } from './ReferralController';

@Module({
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}
