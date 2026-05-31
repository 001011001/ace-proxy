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
   * 响应老板需求：强制验证“不退货协议”，并记录毫秒级法律存证。
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
        disclaimer_version: 'V1.0_NO_RETURN_POLICY',
        consent_timestamp: new Date().getTime(), // 毫秒级时间戳
        audit_trail: {
          ip: compliance.ip,
          device_id: compliance.deviceId,
          user_agent: 'AceProxy-Mobile-App',
        },
        legal_notice_snapshot: "AceProxy adalah layanan jasa titip internasional (Proxy Service). Barang dibeli sesuai instruksi Anda dan tidak dapat ditukar atau dikembalikan (Non-returnable). Silakan gunakan Resale Hub jika tidak puas."
      }
    };

    // 存储至数据库，作为应对金融申诉的核弹级证据
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
    const result = await this.splitter.splitOrder(orderId, payload.items);
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
