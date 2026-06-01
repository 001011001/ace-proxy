import { Injectable, Logger } from '@nestjs/common';
import { VaultService } from '../vault/VaultService';
import { SmartSplitterService } from '../splitter/SmartSplitterService';
import { NotificationService } from '../notification/NotificationService';
import { UserLevelService } from '../membership/UserLevelService';

/**
 * TradeService - 核心交易协调层 (The Glue)
 * 串联支付、账本、拆单和通知。
 */
@Injectable()
export class TradeService {
  private readonly logger = new Logger(TradeService.name);

  constructor(
    private readonly vault: VaultService,
    private readonly splitter: SmartSplitterService,
    private readonly notification: NotificationService,
    private readonly membership: UserLevelService,
  ) {}

  /**
   * 记录用户登录/新手引导时的合规确认
   * 响应老板需求：登录时即让用户知悉代购模式。
   */
  async recordOnboardingConfirmation(userId: string, compliance: { ip: string, deviceId: string }) {
    this.logger.log(`[Trade] User ${userId} confirmed onboarding proxy mode notice. IP: ${compliance.ip}`);
    return {
      success: true,
      confirmed_at: new Date().toISOString(),
      notice_version: 'GENTLE_COMPLIANCE_2.0'
    };
  }

  /**
   * 创建订单并记录合规协议存证
   * 响应老板需求：强制验证“不退货协议”，并记录毫秒级法律存证。
   * 已升级为“温和型告知”存证。
   */
  async createOrder(orderData: any, compliance: { ip: string, deviceId: string, terms_accepted: boolean }) {
    if (!compliance.terms_accepted) {
      throw new Error('LEGAL_ERROR: 用户必须接受跨境代购不退货协议才能下单。');
    }

    this.logger.log(`[Trade] Creating order with audit trail. Fingerprint: ${compliance.deviceId}`);

    const order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      compliance: {
        terms_accepted: true,
        disclaimer_version: 'V2.0_GENTLE_ONBOARDING',
        consent_timestamp: new Date().getTime(),
        audit_trail: {
          ip: compliance.ip,
          device_id: compliance.deviceId,
          user_agent: 'AceProxy-Mobile-App',
        },
        legal_notice_snapshot: "AceProxy adalah layanan jasa titip internasional (Proxy Service). Barang dibeli sesuai instruksi Anda dan tidak dapat ditukar atau dikembalikan (Non-returnable). Silakan gunakan Resale Hub jika tidak puas."
      }
    };

    return order;
  }

  /**
   * 计算带会员折扣的最终费用
   */
  async calculateFinalFees(userId: string, baseFee: number, totalSpend: number) {
    const discountPct = await this.membership.getFeeDiscount(userId, totalSpend);
    const discountAmount = baseFee * (discountPct / 100);
    const finalFee = baseFee - discountAmount;
    
    this.logger.log(`[Trade] Fee calculation for ${userId}: Base ${baseFee} -> Final ${finalFee} (${discountPct}% disc)`);
    return finalFee;
  }

  /**
   * 处理支付成功后的全链路后续逻辑
   */
  async handlePaymentSuccess(orderId: string, payload: any) {
    this.logger.log(`[Trade] Payment success for order ${orderId}. Initializing fulfillment...`);

    // 1. 记账 (Vault Ledger)
    await this.vault.recordOrderLedger(orderId, payload.amounts);

    // 2. 自动拆单 (Smart Splitter)
    // 雅加达试点默认发往 JKT
    const result = await this.splitter.splitOrder(payload.items, payload.destination || 'JKT');
    this.logger.log(`[Trade] Order ${orderId} split into ${result.parcels.length} parcels.`);

    // 3. 推送通知 (Push Notification)
    await this.notification.sendLogisticUpdate(payload.userId, 'PAID_READY_TO_SHIP', orderId);

    return {
      success: true,
      orderId,
      parcelsCount: result.parcels.length
    };
  }
}
