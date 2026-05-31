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
