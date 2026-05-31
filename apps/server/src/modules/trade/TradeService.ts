import { Injectable, Logger } from '@nestjs/common';
import { VaultService } from '../vault/VaultService';
import { SmartSplitterService } from '../splitter/SmartSplitterService';
import { NotificationService } from '../notification/NotificationService';

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
  ) {}

  /**
   * 创建订单并记录合规协议存证
   * 响应老板需求：锁死“不退货”协议，防止后期拒付风险。
   */
  async createOrder(orderData: any, compliance: { ip: string, deviceId: string, confirmed: boolean }) {
    if (!compliance.confirmed) {
      throw new Error('COMPLIANCE_AGREEMENT_REQUIRED: 用户必须确认不退货协议');
    }

    this.logger.log(`[Trade] Creating order with compliance audit trail. IP: ${compliance.ip}`);

    const order = {
      ...orderData,
      id: `ORD-${Date.now()}`,
      compliance: {
        agreement_confirmed: true,
        confirmed_at: new Date().toISOString(),
        user_ip: compliance.ip,
        device_fingerprint: compliance.deviceId,
        legal_notice: "用户已明确知悉跨境代购商品不可退货，并确认此为个人自主意愿。"
      }
    };

    // 此处存入数据库，作为应对 PayPal/Xendit 拒付申诉的核弹级证据
    return order;
  }

  /**
   * 处理支付成功后的全链路后续逻辑
   */
  async handlePaymentSuccess(orderId: string, payload: any) {
    this.logger.log(`[Trade] Payment success for order ${orderId}. Initializing fulfillment...`);

    // 1. 记账 (Vault Ledger)
    await this.vault.recordOrderLedger(orderId, payload.amounts);

    // 2. 自动拆单 (Smart Splitter)
    const parcels = await this.splitter.splitOrder(orderId, payload.items);
    this.logger.log(`[Trade] Order ${orderId} split into ${parcels.length} parcels.`);

    // 3. 推送通知 (Push Notification)
    await this.notification.sendLogisticUpdate(payload.userId, 'PAID_READY_TO_SHIP', orderId);

    return {
      success: true,
      orderId,
      parcelsCount: parcels.length
    };
  }
}
