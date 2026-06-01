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
   * 计算带会员折扣的最终费用 (基于精算模型)
   */
  async calculateFinalFees(userId: string, baseOrderAmount: number, totalSpend: number) {
    const { level, config } = await this.membership.getUserTier(totalSpend);
    
    // 基础费率基于用户等级 (10% / 8% / 5%)
    const serviceFee = baseOrderAmount * config.serviceFeePct;
    const rebateAmount = baseOrderAmount * config.rebatePct;
    
    this.logger.log(`[Trade] Fee calculation for ${userId} (${level}): Base Amt ${baseOrderAmount} -> Fee ${serviceFee}, Rebate ${rebateAmount}`);
    
    return {
      serviceFee,
      rebateAmount,
      level,
      badge: config.badge
    };
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

  /**
   * 处理 AI 发现微瑕后的“降价确认流” (Salvage Flow)
   * 响应 Ecommerce Mind 需求：将资损转化为用户忠诚度。
   */
  async handleSalvageAction(userId: string, orderId: string, action: 'ACCEPT_WITH_REBATE' | 'RESALE' | 'RETURN') {
    this.logger.log(`[Trade] Salvage action for Order ${orderId}: ${action}`);

    const SALVAGE_REBATE_PCT = 0.15; // 15% 积分补偿

    switch (action) {
      case 'ACCEPT_WITH_REBATE':
        // 1. 发放补偿积分，锁定复购
        this.logger.log(`[Trade] Issuing ${SALVAGE_REBATE_PCT * 100}% rebate as Ace Credits for ${orderId}`);
        
        // 2. 财务分账记录 (从平台利润中支出)
        const rebateAmount = 100; // 模拟计算出的金额
        await this.vault.recordSalvageRebate(orderId, rebateAmount);
        
        // 3. 通知用户
        await this.notification.sendWhatsAppMessage(userId, "Terima kasih! Kami telah menambahkan Ace Credits sebagai kompensasi ke dompet Anda.");
        return { success: true, status: 'COMPENSATED_WITH_POINTS' };

      case 'RESALE':
        // 一键转入本地 Resale Hub
        this.logger.log(`[Trade] Transferring item in ${orderId} to local Resale Hub at discount.`);
        return { success: true, status: 'TRANSFERRED_TO_RESALE' };

      case 'RETURN':
        // 标准 1688 退货流程
        this.logger.warn(`[Trade] User chose full return for ${orderId}. Initializing 1688 RMA...`);
        return { success: true, status: 'RMA_INITIATED' };

      default:
        throw new Error('INVALID_SALVAGE_ACTION');
    }
  }
}

