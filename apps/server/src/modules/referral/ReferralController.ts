import { Controller, Post, Get, Body, Param, Logger, UseGuards } from '@nestjs/common';
import { ReferralService } from './ReferralService';
import {
  GenerateInfluencerLinkDto,
  CalculateCommissionDto,
  TriggerPodShareRewardDto,
  GeneratePartnerInviteCodeDto,
} from '../../dto/marketing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';

@Controller('referral')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class ReferralController {
  private readonly logger = new Logger(ReferralController.name);

  constructor(private readonly referral: ReferralService) {}

  /**
   * 生成红人专属推广链接
   */
  @Post('influencer-link')
  async generateInfluencerLink(@Body() dto: GenerateInfluencerLinkDto) {
    return this.referral.generateInfluencerLink(dto.influencerId, dto.productId);
  }

  /**
   * 计算分佣
   */
  @Post('calculate-commission')
  async calculateCommission(@Body() dto: CalculateCommissionDto) {
    return this.referral.calculateCommission(dto.orderAmount, dto.role);
  }

  /**
   * 生成邀请码（雅加达指挥官）
   */
  @Post('partner-invite-code')
  async generatePartnerInviteCode(@Body() dto: GeneratePartnerInviteCodeDto) {
    return this.referral.generatePartnerInviteCode(dto.partnerName);
  }

  /**
   * 触发门缝照社交分享奖励
   */
  @Post('pod-share-reward')
  async triggerPodShareReward(@Body() dto: TriggerPodShareRewardDto) {
    return this.referral.triggerPodShareReward(dto.userId, dto.orderId);
  }
}
