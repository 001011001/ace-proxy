import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { generateInviteCode } from '../../common/uuid';

/**
 * ReferralService - 社交裂变与红人激励引擎
 * 实现“自动红人寄样”与“分销分佣”逻辑。
 */
@Injectable()
export class ReferralService {
  /**
   * 生成红人专属推广链接
   */
  async generateInfluencerLink(influencerId: string, productId: string) {
    return `https://aceproxy.com/p/${productId}?ref=${influencerId}`;
  }

  /**
   * 计算分佣
   * @param orderAmount 订单金额
   * @param role 角色 (Partner/Influencer)
   */
  async calculateCommission(orderAmount: number, role: 'PARTNER' | 'INFLUENCER') {
    const rates = {
      PARTNER: 0.05,     // 团长 5%
      INFLUENCER: 0.15,  // 红人 15% (含流量溢价)
    };

    return orderAmount * (rates[role] || 0.02);
  }

  /**
   * 为“雅加达指挥官”生成唯一邀请码
   */
  async generatePartnerInviteCode(partnerName: string) {
    return generateInviteCode(partnerName);
  }

  /**
   * 触发“门缝照 (POD)”社交分享奖励
   */
  async triggerPodShareReward(userId: string, orderId: string) {
    // 逻辑：验证 POD 视频/照片已上传并分享到社交平台
    // 奖励：发放一张 5-10 RMB 的国际运单抵扣券
    return {
      userId,
      orderId,
      rewardType: 'SHIPPING_COUPON',
      amount: 5,
      expiry: '30d'
    };
  }
}
