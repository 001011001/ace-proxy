import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VaultService } from '../vault/VaultService';
import { SmartSplitterService } from '../splitter/SmartSplitterService';
import { NotificationService } from '../notification/NotificationService';
import { UserLevelService } from '../membership/UserLevelService';
import { ReferralService } from '../referral/ReferralService';

/**
 * TradeService - 核心交易协调层 (The Glue)
 * 串联支付、账本、拆单和通知。现已接入 Prisma。
 */
@Injectable()
export class TradeService {
  private readonly logger = new Logger(TradeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly vault: VaultService,
    private readonly splitter: SmartSplitterService,
    private readonly notification: NotificationService,
    private readonly membership: UserLevelService,
    private readonly referral: ReferralService,
  ) {}

  /**
   * 记录用户登录/新手引导时的合规确认
   */
  async recordOnboardingConfirmation(userId: string, compliance: { ip: string, deviceId: string }) {
    this.logger.log(`[Trade] User ${userId} confirmed onboarding proxy mode notice. IP: ${compliance.ip}`);
    return {
      success: true,
      confirmed_at: new Date().toISOString(),
      notice_version: 'GENTLE_COMPLIANCE_2.0',
    };
  }

  /**
   * 创建订单并记录合规协议存证
   * 现已接入 Prisma，数据持久化到 ace_orders 表。
   */
  async createOrder(orderData: any, compliance: { ip: string, deviceId: string, terms_accepted: boolean }) {
    if (!compliance.terms_accepted) {
      throw new BadRequestException('LEGAL_ERROR: 用户必须接受跨境代购不退货协议才能下单。');
    }

    this.logger.log(`[Trade] Creating order with audit trail. Device: ${compliance.deviceId}`);

    const order = await this.prisma.aceOrder.create({
      data: {
        id: `ORD-${Date.now()}`,
        userId: orderData.userId,
        partnerId: orderData.partner_id || null,
        status: 'PENDING',
        totalAmount: orderData.amounts?.total || 0,
        sourceCost: orderData.amounts?.cost || 0,
        shippingFee: orderData.amounts?.shipping || 0,
        serviceFee: orderData.amounts?.serviceFee || 0,
        complianceAudit: JSON.stringify({
          terms_accepted: true,
          disclaimer_version: 'V2.0_GENTLE_ONBOARDING',
          consent_timestamp: Date.now(),
          audit_trail: {
            ip: compliance.ip,
            device_id: compliance.deviceId,
            user_agent: 'AceProxy-Mobile-App',
          },
          legal_notice_snapshot: "AceProxy adalah layanan jasa titip internasional (Proxy Service). Barang dibeli sesuai instruksi Anda dan tidak dapat ditukar atau dikembalikan (Non-returnable). Silakan gunakan Resale Hub jika tidak puas.",
        }),
      },
    });

    return order;
  }

  /**
   * 计算带会员折扣的最终费用 (基于精算模型)
   */
  async calculateFinalFees(userId: string, baseOrderAmount: number, totalSpend: number) {
    const { level, config } = await this.membership.getUserTier(totalSpend);

    const serviceFee = baseOrderAmount * config.serviceFeePct;
    const rebateAmount = baseOrderAmount * config.rebatePct;

    this.logger.log(`[Trade] Fee calculation for ${userId} (${level}): Base ${baseOrderAmount} -> Fee ${serviceFee}, Rebate ${rebateAmount}`);

    return {
      serviceFee,
      rebateAmount,
      level,
      badge: config.badge,
    };
  }

  /**
   * 处理支付成功后的全链路后续逻辑
   */
  async handlePaymentSuccess(orderId: string, payload: any) {
    this.logger.log(`[Trade] Payment success for order ${orderId}. Initializing fulfillment...`);

    // 1. 记账 (Vault Ledger)
    let partnerCommission = 0;
    if (payload.partnerId) {
      partnerCommission = await this.referral.calculateCommission(payload.amounts.total, 'PARTNER');
      this.logger.log(`[Trade] Partner commission: ${partnerCommission}`);
    }

    await this.vault.recordOrderLedger(orderId, {
      ...payload.amounts,
      partnerCommission,
      tierConfig: payload.tierConfig || { serviceFeePct: 0.10, rebatePct: 0 },
    });

    // 2. 自动拆单
    const result = await this.splitter.splitOrder(payload.items, payload.destination || 'JKT');
    this.logger.log(`[Trade] Order ${orderId} split into ${result.parcels.length} parcels.`);

    // 3. 更新订单状态
    await this.prisma.aceOrder.update({
      where: { id: orderId },
      data: { status: 'PAID' },
    });

    // 4. 推送通知
    await this.notification.sendLogisticUpdate(payload.userId, 'PAID_READY_TO_SHIP', orderId);

    return {
      success: true,
      orderId,
      parcelsCount: result.parcels.length,
    };
  }

  /**
   * 处理 AI 发现微瑕后的"降价确认流" (Salvage Flow)
   */
  async handleSalvageAction(userId: string, orderId: string, action: 'ACCEPT_WITH_REBATE' | 'RESALE' | 'RETURN') {
    this.logger.log(`[Trade] Salvage action for Order ${orderId}: ${action}`);

    const SALVAGE_REBATE_PCT = 0.15;

    switch (action) {
      case 'ACCEPT_WITH_REBATE':
        // 发放补偿积分，锁定复购
        const order = await this.prisma.aceOrder.findUnique({ where: { id: orderId } });
        const rebateAmount = Number(order?.totalAmount || 0) * SALVAGE_REBATE_PCT;
        await this.vault.recordSalvageRebate(orderId, rebateAmount);
        await this.notification.sendWhatsAppMessage(userId, 'Terima kasih! Ace Credits telah ditambahkan ke dompet Anda.');

        // 更新用户积分
        await this.prisma.aceUser.update({
          where: { id: userId },
          data: { credits: { increment: rebateAmount } },
        });

        return { success: true, status: 'COMPENSATED_WITH_POINTS', rebateAmount };

      case 'RESALE':
        await this.prisma.aceOrder.update({ where: { id: orderId }, data: { status: 'RESALE' } });
        return { success: true, status: 'TRANSFERRED_TO_RESALE' };

      case 'RETURN':
        this.logger.warn(`[Trade] Full return for ${orderId}.`);
        await this.prisma.aceOrder.update({ where: { id: orderId }, data: { status: 'RMA_INITIATED' } });
        return { success: true, status: 'RMA_INITIATED' };

      default:
        throw new BadRequestException('INVALID_SALVAGE_ACTION');
    }
  }
}
