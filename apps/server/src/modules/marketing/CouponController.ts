import { Controller, Post, Get, Body, Param, Query, Logger, UseGuards } from '@nestjs/common';
import { CouponService } from './CouponService';
import { ClaimCouponDto, ApplyCouponDto, ListUserCouponsDto } from '../../dto/marketing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';

@Controller('coupon')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class CouponController {
  private readonly logger = new Logger(CouponController.name);

  constructor(private readonly coupon: CouponService) {}

  /**
   * 查询优惠券（按 code）
   */
  @Get(':code')
  async getByCode(@Param('code') code: string) {
    return this.coupon.getByCode(code);
  }

  /**
   * 用户领取优惠券
   */
  @Post('claim')
  async claimCoupon(@Body() dto: ClaimCouponDto) {
    this.logger.log(`[Coupon] User ${dto.userId} claiming ${dto.code}`);
    return this.coupon.claimCoupon(dto.userId, dto.code);
  }

  /**
   * 列出用户已领取的优惠券
   */
  @Get('user/:userId')
  async listUserCoupons(@Param('userId') userId: string) {
    return this.coupon.listUserCoupons(userId);
  }

  /**
   * 验证并应用优惠券（计算折扣）
   */
  @Post('apply')
  async applyCoupon(@Body() dto: ApplyCouponDto) {
    return this.coupon.applyCoupon(dto.code, dto.orderAmount);
  }
}
