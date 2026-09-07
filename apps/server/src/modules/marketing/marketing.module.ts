import { Module } from '@nestjs/common';
import { CouponService } from '../marketing/CouponService';
import { CouponController } from '../marketing/CouponController';
import { ReferralService } from '../referral/ReferralService';
import { ReferralController } from '../referral/ReferralController';
import { UserLevelService } from '../membership/UserLevelService';
import { NotificationService } from '../notification/NotificationService';
import { AiPushService } from '../push/AiPushService';
import { AiPushController } from '../push/AiPushController';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CouponController, ReferralController, AiPushController],
  providers: [CouponService, ReferralService, UserLevelService, NotificationService, AiPushService],
  exports: [CouponService, NotificationService],
})
export class MarketingModule {}
