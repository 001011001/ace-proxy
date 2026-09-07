import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class ClaimCouponDto {
  @IsString()
  userId: string;

  @IsString()
  code: string;
}

export class ApplyCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  orderAmount: number;
}

export class ListUserCouponsDto {
  @IsString()
  userId: string;
}

export class GenerateInfluencerLinkDto {
  @IsString()
  influencerId: string;

  @IsString()
  productId: string;
}

export class CalculateCommissionDto {
  @IsNumber()
  @Min(0)
  orderAmount: number;

  @IsString()
  role: 'PARTNER' | 'INFLUENCER';
}

export class TriggerPodShareRewardDto {
  @IsString()
  userId: string;

  @IsString()
  orderId: string;
}

export class GeneratePartnerInviteCodeDto {
  @IsString()
  partnerName: string;
}
