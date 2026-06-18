import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentService } from './PaymentService';

@ApiTags('Payment — 支付')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ─── 1. 创建发票（Xendit Invoice）─────────────────────
  @UseGuards(JwtAuthGuard)
  @Post('create-invoice')
  async createInvoice(
    @Req() req: any,
    @Body()
    body: {
      orderId: string;
      amount: number;
      description: string;
      paymentMethods?: string[];
    },
  ) {
    return this.paymentService.createInvoice({
      orderId: body.orderId,
      amount: body.amount,
      payerEmail: req.user.email,
      description: body.description,
      successRedirectUrl: `aceproxy://payment/success?orderId=${body.orderId}`,
      failureRedirectUrl: `aceproxy://payment/failed?orderId=${body.orderId}`,
      paymentMethods: body.paymentMethods,
    });
  }

  // ─── 2. 创建支付链接（简化版）─────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post('create-payment-link')
  async createPaymentLink(
    @Body()
    body: {
      orderId: string;
      amount: number;
      description: string;
    },
  ) {
    return this.paymentService.createPaymentLink({
      orderId: body.orderId,
      amount: body.amount,
      description: body.description,
      shouldSendEmail: false,
    });
  }

  // ─── 3. 获取可用支付方式 ──────────────────────────────
  @Get('methods')
  async getPaymentMethods() {
    return this.paymentService.getAvailablePaymentMethods();
  }

  // ─── 4. 查询发票状态 ──────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('invoice/:invoiceId/status')
  async getInvoiceStatus(@Param('invoiceId') invoiceId: string) {
    return this.paymentService.getInvoiceStatus(invoiceId);
  }

  // ─── 5. 查询订单所有发票 ──────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('order/:orderId/invoices')
  async getInvoicesByOrderId(@Param('orderId') orderId: string) {
    return this.paymentService.getInvoicesByOrderId(orderId);
  }

  // ─── 6. 退款 ──────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Post('invoice/:invoiceId/refund')
  async refundInvoice(
    @Param('invoiceId') invoiceId: string,
    @Body() body: { amount?: number; reason: string },
  ) {
    return this.paymentService.refundInvoice({
      invoiceId,
      amount: body.amount,
      reason: body.reason,
    });
  }

  // ─── 7. Xendit Webhook 回调（无需 JWT！）────────────
  /**
   * Xendit 会 POST 到这个地址当发票状态变化
   * 文档：https://developers.xendit.co/api-reference/invoice/callbacks
   *
   * Header 中会包含 `X-Callback-Token`，用于验证来源
   */
  @Post('webhook/xendit')
  async handleXenditWebhook(
    @Body() payload: any,
    @Req() req: any,
  ) {
    const callbackToken = req.headers['x-callback-token'] as string | undefined;
    const hmacSignature = req.headers['x-xendit-signature'] as string | undefined;
    // Xendit 发送 raw body；NestJS 已经 parse 为 JSON 对象
    // HMAC 验证需要原始 string，NestJS raw 体可通过 rawBody 中间件获取
    const rawBody = req.rawBody || JSON.stringify(payload);
    return this.paymentService.handleWebhook(payload, callbackToken, hmacSignature, rawBody);
  }

  // ─── 8. 收款对账报告 ──────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('reconciliation')
  async getReconciliation(
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ) {
    const startDate = startDateStr ? new Date(startDateStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = endDateStr ? new Date(endDateStr) : new Date();

    return this.paymentService.getCollectionReconciliation({ startDate, endDate });
  }
}
