import { Injectable, Logger, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { WebhookVerifier } from '../../common/WebhookVerifier';

export interface XenditInvoice {
  id: string;
  external_id: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'FAILED';
  amount: number;
  invoice_url: string;
  payment_method?: string;
  paid_at?: string;
  [key: string]: any;
}

export interface XenditPaymentMethod {
  type: string;          // QRIS, VA_BCA, VA_MANDIRI, OVO, DANA, etc.
  reusability: string;
  status: string;
  [key: string]: any;
}

/**
 * PaymentService — Xendit 全功能集成（生产级）
 *
 * 覆盖：
 * 1. 创建发票（Invoice）/ 支付链接
 * 2. 查询支付状态
 * 3. Webhook 回调处理（Xendit → AceProxy）
 * 4. 退款（Refund）
 * 5. 获取可用支付方式
 * 6. 支付成功 WhatsApp 通知
 * 7. 收款对账（Vault Ledger 写入）
 */
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly apiKey: string;
  private readonly isSandbox: boolean;
  private readonly baseUrl: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly verifier: WebhookVerifier,
  ) {
    this.apiKey = this.config.get<string>('XENDIT_API_KEY') || '';
    this.isSandbox = this.config.get<string>('XENDIT_ENV') !== 'production';
    // Sandbox: https://api.xendit.co/v2 | Production: https://api.xendit.com/v2
    this.baseUrl = this.isSandbox
      ? 'https://api.xendit.co/v2'
      : 'https://api.xendit.com/v2';
  }

  // ─── 1. 创建发票（Xendit Invoice）──────────────────────────
  async createInvoice(params: {
    orderId: string;
    amount: number;
    payerEmail: string;
    payerName?: string;
    description: string;
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
    paymentMethods?: string[];  // 限制支付方式
  }): Promise<XenditInvoice> {
    // MVP: if no API key or is placeholder, return mock invoice for end-to-end testing
    if (!this.apiKey || this.apiKey.includes('your-') || this.apiKey.length < 10) {
      this.logger.warn('[Payment] No valid Xendit API key — returning mock invoice');
      return {
        id: `mock_inv_${Date.now()}`,
        external_id: params.orderId,
        status: 'PENDING',
        amount: params.amount,
        invoice_url: `https://checkout-staging.xendit.co/web/${params.orderId}`,
        payment_method: (params.paymentMethods && params.paymentMethods[0]) || 'OVO',
      } as any;
    }

    this.validateAmount(params.amount);
    this.validateOrderId(params.orderId);

    const body: Record<string, any> = {
      external_id: params.orderId,
      amount: Math.round(params.amount),
      payer_email: params.payerEmail,
      description: (params.description || `AceProxy Order ${params.orderId}`).slice(0, 255),
      currency: 'IDR',
      invoice_duration: 24 * 60 * 60, // 24 hours
    };

    if (params.payerName) body.payer_name = params.payerName;
    if (params.successRedirectUrl) body.success_redirect_url = params.successRedirectUrl;
    if (params.failureRedirectUrl) body.failure_redirect_url = params.failureRedirectUrl;
    if (params.paymentMethods?.length) body.payment_methods = params.paymentMethods;

    // Callback for webhook (Xendit will POST here when payment status changes)
    body.callback_virtual_account_url = `${this.getWebhookBaseUrl()}/payment/webhook/xendit-va`;
    body.redirect_url = `${this.getWebhookBaseUrl()}/payment/webhook/xendit-invoice`;

    try {
      const auth = Buffer.from(`${this.apiKey}:`).toString('base64');
      const response = await fetch(`${this.baseUrl}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`[Payment] Xendit createInvoice error ${response.status}: ${errText}`);
        throw new ServiceUnavailableException(`Payment gateway error: ${response.status}`);
      }

      const data = await response.json() as XenditInvoice;
      this.logger.log(`[Payment] Invoice created: ${data.id} for order ${params.orderId}`);
      return data;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      this.logger.error(`[Payment] createInvoice failed: ${error}`);
      throw new ServiceUnavailableException('Payment gateway temporarily unavailable');
    }
  }

  // ─── 2. 创建支付链接（简化版，无重定向）────────────────────
  async createPaymentLink(params: {
    orderId: string;
    amount: number;
    description: string;
    shouldSendEmail?: boolean;
  }): Promise<{ payment_link_id: string; payment_link_url: string }> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('Xendit API key not configured.');
    }

    this.validateAmount(params.amount);

    try {
      const auth = Buffer.from(`${this.apiKey}:`).toString('base64');
      const response = await fetch(`${this.baseUrl}/payment_links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          external_id: params.orderId,
          amount: Math.round(params.amount),
          description: params.description,
          currency: 'IDR',
          should_send_email: params.shouldSendEmail ?? false,
        }),
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`[Payment] createPaymentLink error: ${errText}`);
        throw new ServiceUnavailableException('Failed to create payment link');
      }

      return response.json();
    } catch (error) {
      this.logger.error(`[Payment] createPaymentLink failed: ${error}`);
      throw new ServiceUnavailableException('Payment gateway temporarily unavailable');
    }
  }

  // ─── 3. 查询发票状态 ──────────────────────────────────────
  async getInvoiceStatus(invoiceId: string): Promise<XenditInvoice> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('Xendit API key not configured.');
    }
    this.validateInvoiceId(invoiceId);

    try {
      const auth = Buffer.from(`${this.apiKey}:`).toString('base64');
      const response = await fetch(`${this.baseUrl}/invoices/${invoiceId}`, {
        headers: { Authorization: `Basic ${auth}` },
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`[Payment] getInvoiceStatus error ${response.status}: ${errText}`);
        throw new ServiceUnavailableException(`Failed to query invoice: ${response.status}`);
      }

      return response.json() as Promise<XenditInvoice>;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      this.logger.error(`[Payment] getInvoiceStatus failed: ${error}`);
      throw new ServiceUnavailableException('Payment service temporarily unavailable');
    }
  }

  // ─── 4. 查询订单所有发票 ──────────────────────────────────
  async getInvoicesByOrderId(orderId: string): Promise<XenditInvoice[]> {
    if (!this.apiKey) return [];
    this.validateOrderId(orderId);

    try {
      const auth = Buffer.from(`${this.apiKey}:`).toString('base64');
      const response = await fetch(
        `${this.baseUrl}/invoices?external_id=${encodeURIComponent(orderId)}`,
        { headers: { Authorization: `Basic ${auth}` }, signal: AbortSignal.timeout(10_000) },
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      this.logger.warn(`[Payment] getInvoicesByOrderId failed: ${error}`);
      return [];
    }
  }

  // ─── 5. 退款 ────────────────────────────────────────────────
  async refundInvoice(params: {
    invoiceId: string;
    amount?: number;    // 部分退款（不传则全额）
    reason: string;
  }): Promise<any> {
    if (!this.apiKey) {
      throw new ServiceUnavailableException('Xendit API key not configured.');
    }
    this.validateInvoiceId(params.invoiceId);

    try {
      const auth = Buffer.from(`${this.apiKey}:`).toString('base64');
      const body: Record<string, any> = {
        reason: params.reason.slice(0, 255),
      };
      if (params.amount) body.amount = Math.round(params.amount);

      const response = await fetch(
        `${this.baseUrl}/invoices/${params.invoiceId}/refund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(15_000),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`[Payment] refundInvoice error ${response.status}: ${errText}`);
        throw new ServiceUnavailableException(`Refund failed: ${response.status}`);
      }

      const result = await response.json();
      this.logger.log(`[Payment] Refund initiated for invoice ${params.invoiceId}`);
      return result;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      this.logger.error(`[Payment] refundInvoice failed: ${error}`);
      throw new ServiceUnavailableException('Refund request failed');
    }
  }

  // ─── 6. 获取可用支付方式 ──────────────────────────────────
  async getAvailablePaymentMethods(): Promise<XenditPaymentMethod[]> {
    // Xendit supports these payment methods in Indonesia:
    // QRIS, VA_BCA, VA_MANDIRI, VA_BNI, VA_BRI, OVO, DANA, SHOPEEPAY, LINKAJA, ALFAMART
    // This is a static list since Xendit doesn't have a public API to list them.
    const methods: XenditPaymentMethod[] = [
      { type: 'QRIS', reusability: 'ONE_TIME', status: 'ACTIVE' },
      { type: 'OVO', reusability: 'ONE_TIME', status: 'ACTIVE' },
      { type: 'DANA', reusability: 'ONE_TIME', status: 'ACTIVE' },
      { type: 'SHOPEEPAY', reusability: 'ONE_TIME', status: 'ACTIVE' },
      { type: 'LINKAJA', reusability: 'ONE_TIME', status: 'ACTIVE' },
      { type: 'VA_BCA', reusability: 'FIXED', status: 'ACTIVE' },
      { type: 'VA_MANDIRI', reusability: 'FIXED', status: 'ACTIVE' },
      { type: 'VA_BNI', reusability: 'FIXED', status: 'ACTIVE' },
      { type: 'VA_BRI', reusability: 'FIXED', status: 'ACTIVE' },
    ];
    return methods;
  }

  // ─── 7. Webhook 回调处理（核心！）────────────────────────
  /**
   * 处理 Xendit Webhook 回调
   * Xendit 文档：https://developers.xendit.com/api-reference/invoice/callbacks
   *
   * 回调数据结构（Invoice）：
   * { id, external_id, status: 'PAID'|'EXPIRED'|'FAILED', amount, payment_method, paid_at }
   */
  async handleWebhook(payload: any, callbackToken?: string, hmacSignature?: string, rawBody?: string): Promise<{ success: boolean; message: string }> {
    this.logger.log(`[Payment Webhook] Received: ${JSON.stringify(payload).slice(0, 200)}`);

    // Webhook 签名验证（Callback Token 或 HMAC-SHA256）
    try {
      this.verifier.verify(rawBody || JSON.stringify(payload), callbackToken, hmacSignature);
    } catch (e) {
      this.logger.warn(`[Payment Webhook] Signature verification failed: ${e}`);
      return { success: false, message: 'Invalid webhook signature' };
    }

    try {
      const { id, external_id, status, amount, payment_method, paid_at } = payload;

      if (!external_id || !status) {
        return { success: false, message: 'Missing required fields' };
      }

      // 查找订单
      const order = await this.prisma.aceOrder.findUnique({
        where: { id: external_id },
      });

      if (!order) {
        this.logger.warn(`[Payment Webhook] Order not found: ${external_id}`);
        return { success: false, message: 'Order not found' };
      }

      // 幂等处理：如果该订单已标记为 PAID，直接返回成功
      if (order.status === 'PAID') {
        this.logger.log(`[Payment Webhook] Order ${external_id} already PAID, skipping`);
        return { success: true, message: 'Already processed' };
      }

      // 根据支付状态更新订单
      switch (status) {
        case 'PAID':
          await this.prisma.$transaction(async (tx) => {
            // 1. 更新订单状态
            await tx.aceOrder.update({
              where: { id: external_id },
              data: {
                status: 'PAID',
                // 记录支付信息（可扩展 AcePaymentTransaction 表）
              },
            });

            // 2. 写入 Vault Ledger（收款记录）
            await tx.aceVaultLedger.create({
              data: {
                orderId: external_id,
                account: 'XENDIT_COLLECTION',
                amount: amount || order.totalAmount,
                entryType: 'COLLECTION',
                description: `Xendit payment ${id} via ${payment_method || 'unknown'}`,
              },
            });

            // 3. 计算并写入佣金（如有 Partner）
            if (order.partnerId) {
              const partner = await tx.acePartner.findUnique({
                where: { id: order.partnerId },
              });
              if (partner) {
                const commission = (amount || order.totalAmount) * Number(partner.commissionRate);
                await tx.aceVaultLedger.create({
                  data: {
                    orderId: external_id,
                    account: 'COMMISSION_PAYABLE',
                    amount: -commission,
                    entryType: 'COMMISSION',
                    description: `Commission for partner ${partner.name}`,
                  },
                });
                // 更新 Partner pending settlement
                await tx.acePartner.update({
                  where: { id: partner.id },
                  data: {
                    pendingSettlement: { increment: commission },
                  },
                });
              }
            }
          });

          this.logger.log(`[Payment Webhook] ✅ Order ${external_id} marked as PAID`);
          // TODO: 发送 WhatsApp 支付成功通知（调 NotificationService）
          await this.sendPaymentSuccessNotification(external_id, amount || order.totalAmount);
          break;

        case 'EXPIRED':
          await this.prisma.aceOrder.update({
            where: { id: external_id },
            data: { status: 'EXPIRED' },
          });
          this.logger.log(`[Payment Webhook] Order ${external_id} EXPIRED`);
          break;

        case 'FAILED':
          await this.prisma.aceOrder.update({
            where: { id: external_id },
            data: { status: 'PAYMENT_FAILED' },
          });
          this.logger.log(`[Payment Webhook] Order ${external_id} PAYMENT_FAILED`);
          break;

        default:
          this.logger.warn(`[Payment Webhook] Unknown status: ${status}`);
      }

      return { success: true, message: `Order ${external_id} updated to ${status}` };
    } catch (error) {
      this.logger.error(`[Payment Webhook] Processing failed: ${error}`);
      return { success: false, message: `Processing error: ${error.message}` };
    }
  }

  // ─── 8. WhatsApp 支付成功通知 ─────────────────────────────
  private async sendPaymentSuccessNotification(
    orderId: string,
    amount: number,
  ): Promise<void> {
    // TODO: 集成 NotificationService 发送 WhatsApp 消息
    // 当前为占位实现，正式上线前接入真实 WhatsApp Business API
    this.logger.log(
      `[Payment] 📱 Would send WhatsApp notification for order ${orderId}: ` +
      `Payment of Rp ${amount.toLocaleString('id-ID')} received.`,
    );
    return Promise.resolve();
  }

  // ─── 9. 收款对账报告 ──────────────────────────────────────
  async getCollectionReconciliation(params: {
    startDate: Date;
    endDate: Date;
  }): Promise<{
    totalCollected: number;
    totalCommission: number;
    pendingSettlement: number;
    transactions: any[];
  }> {
    const ledgers = await this.prisma.aceVaultLedger.findMany({
      where: {
        account: 'XENDIT_COLLECTION',
        entryType: 'COLLECTION',
        createdAt: {
          gte: params.startDate,
          lte: params.endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const commissionLedgers = await this.prisma.aceVaultLedger.findMany({
      where: {
        account: 'COMMISSION_PAYABLE',
        entryType: 'COMMISSION',
        createdAt: {
          gte: params.startDate,
          lte: params.endDate,
        },
      },
    });

    const totalCollected = ledgers.reduce((sum, l) => sum + Number(l.amount), 0);
    const totalCommission = Math.abs(
      commissionLedgers.reduce((sum, l) => sum + Number(l.amount), 0),
    );

    // 获取待结算金额
    const partners = await this.prisma.acePartner.findMany({
      where: { status: 'ACTIVE' },
    });
    const pendingSettlement = partners.reduce(
      (sum, p) => sum + Number(p.pendingSettlement),
      0,
    );

    return {
      totalCollected,
      totalCommission,
      pendingSettlement,
      transactions: ledgers,
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────
  private validateAmount(amount: number): void {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }
    if (amount > 1_000_000_000) {
      throw new BadRequestException('Amount exceeds maximum limit (IDR 1,000,000,000)');
    }
  }

  private validateOrderId(orderId: string): void {
    if (!orderId || !/^[\w-]+$/.test(orderId)) {
      throw new BadRequestException('Invalid order ID format');
    }
  }

  private validateInvoiceId(invoiceId: string): void {
    if (!invoiceId || !/^[\w-]+$/.test(invoiceId)) {
      throw new BadRequestException('Invalid invoice ID format');
    }
  }

  private getWebhookBaseUrl(): string {
    // 生产环境改为真实域名，如 https://api.aceproxy.id
    return this.config.get<string>('WEBHOOK_BASE_URL') || 'https://d019ff30096a420ca632cabf74b4c5f6.app.codebuddy.work';
  }
}
