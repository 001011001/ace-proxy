import { Injectable, Logger } from '@nestjs/common';
import { VaultService } from '../vault/VaultService';

/**
 * ResaleHubService - C2C 转卖市场核心
 * 解决跨境退货痛点：用户不喜欢的货直接在本地站内转卖。
 */
@Injectable()
export class ResaleHubService {
  private readonly logger = new Logger(ResaleHubService.name);

  constructor(private readonly vault: VaultService) {}

  /**
   * 将已收货订单转为待转卖状态
   * 逻辑：原买家挂牌 -> 锁定货权 -> 调整 Vault 账本（利润重分配）
   */
  async listForResale(orderId: string, resalePrice: number) {
    this.logger.log(`[ResaleHub] Listing order ${orderId} for resale at ${resalePrice}`);
    
    // 1. 调用 Vault 记录转卖准备金
    // 2. 标记订单状态为 RESALE_PENDING
    
    return {
      status: 'LISTED',
      orderId,
      resalePrice,
      platformFee: resalePrice * 0.05 // 平台收 5% 撮合费
    };
  }

  /**
   * 完成转卖交易
   */
  async completeResale(orderId: string, newBuyerId: string) {
    this.logger.log(`[ResaleHub] Completing resale for order ${orderId} to user ${newBuyerId}`);
    
    // 触发结算：原买家回款，平台扣佣金，新买家确认收货
    return {
      success: true,
      settlementTimestamp: new Date().toISOString()
    };
  }
}
