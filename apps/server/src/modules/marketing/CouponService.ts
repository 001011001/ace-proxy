import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * CouponService - 营销激励引擎
 *
 * 负责雅加达开斋节促销券、裂变红包等发放逻辑。
 * 现已接入 Prisma，数据持久化到 ace_coupons 表。
 */
@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 查询优惠券（按 code）
   */
  async getByCode(code: string) {
    const coupon = await this.prisma.aceCoupon.findUnique({ where: { code } });
    if (!coupon) throw new NotFoundException('COUPON_NOT_FOUND');
    return coupon;
  }

  /**
   * 用户领取优惠券
   */
  async claimCoupon(userId: string, code: string) {
    const coupon = await this.prisma.aceCoupon.findUnique({ where: { code } });
    if (!coupon) throw new NotFoundException('COUPON_NOT_FOUND');
    if (coupon.status !== 'ACTIVE') throw new BadRequestException('COUPON_NOT_ACTIVE');
    if (coupon.usedCount >= coupon.usageLimit) throw new BadRequestException('COUPON_EXHAUSTED');
    if (coupon.claimedAt) throw new BadRequestException('COUPON_ALREADY_CLAIMED');

    const updated = await this.prisma.aceCoupon.update({
      where: { id: coupon.id },
      data: {
        usedCount: { increment: 1 },
        claimedAt: new Date(),
      },
    });

    this.logger.log(`[Coupon] User ${userId} claimed coupon ${code}`);
    return updated;
  }

  /**
   * 列出用户已领取的优惠券
   *
   * @note AceCoupon 表当前无 user-coupon 关联字段，通过 claimedAt 非空近似表示"已被领取"。
   *       正式上线前应增加 AceUserCoupon 关联表精确追踪用户-优惠券关系。
   * @todo P1 — 扩展 Prisma Schema 增加 AceUserCoupon 关联表，实现多对多领取追踪
   */
  async listUserCoupons(_userId: string) {
    this.logger.warn('[MOCK] CouponService.listUserCoupons — 通过 claimedAt 字段近似查询，需增加关联表');
    const coupons = await this.prisma.aceCoupon.findMany({
      where: { claimedAt: { not: null }, status: 'ACTIVE' },
      orderBy: { claimedAt: 'desc' },
    });
    return coupons;
  }

  /**
   * 验证并应用优惠券
   */
  async applyCoupon(code: string, orderAmount: number) {
    const coupon = await this.prisma.aceCoupon.findUnique({ where: { code } });
    if (!coupon) throw new NotFoundException('COUPON_NOT_FOUND');
    if (coupon.status !== 'ACTIVE') throw new BadRequestException('COUPON_NOT_ACTIVE');

    const now = new Date();
    if (now < coupon.startDate) throw new BadRequestException('COUPON_NOT_YET_VALID');
    if (now > coupon.endDate) throw new BadRequestException('COUPON_EXPIRED');

    const minSpend = Number(coupon.minSpend);
    if (orderAmount < minSpend) throw new BadRequestException('MIN_SPEND_NOT_MET');

    const value = Number(coupon.value);
    let discount: number;
    if (coupon.type === 'FIXED') {
      discount = value;
    } else {
      discount = (orderAmount * value) / 100;
      const maxDiscount = coupon.maxDiscount ? Number(coupon.maxDiscount) : 0;
      if (maxDiscount > 0 && discount > maxDiscount) discount = maxDiscount;
    }

    return {
      discount,
      finalAmount: orderAmount - discount,
      couponId: coupon.id,
    };
  }
}
