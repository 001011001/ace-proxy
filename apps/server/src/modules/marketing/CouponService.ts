import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';

export interface Coupon {
  id: string;
  code: string;
  type: 'FIXED' | 'PERCENTAGE';
  value: number;
  minSpend: number;
  expiresAt: Date;
}

/**
 * CouponService - 营销激励引擎
 * 负责雅加达开斋节促销券、裂变红包等发放逻辑。
 */
@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);
  private coupons: Map<string, Coupon> = new Map();

  constructor() {
    // 预置雅加达开斋节“开门利差券”
    this.createCoupon({
      id: 'EID-2026-WELCOME',
      code: 'LEBARAN2026',
      type: 'FIXED',
      value: 15000, // 15k IDR
      minSpend: 100000,
      expiresAt: new Date('2026-04-15')
    });
  }

  createCoupon(coupon: Coupon) {
    this.coupons.set(coupon.code, coupon);
    this.logger.log(`[Coupon] Created coupon: ${coupon.code}`);
  }

  /**
   * 验证并应用优惠券
   */
  async applyCoupon(code: string, orderAmount: number) {
    const coupon = this.coupons.get(code);
    if (!coupon) throw new NotFoundException('COUPON_NOT_FOUND');
    if (new Date() > coupon.expiresAt) throw new BadRequestException('COUPON_EXPIRED');
    if (orderAmount < coupon.minSpend) throw new BadRequestException('MIN_SPEND_NOT_MET');

    const discount = coupon.type === 'FIXED' 
      ? coupon.value 
      : (orderAmount * coupon.value) / 100;

    return {
      discount,
      finalAmount: orderAmount - discount,
      couponId: coupon.id
    };
  }
}
