import { Controller, Post, Body, Get, UseGuards, Param, Query } from '@nestjs/common';
import { VaultService } from './VaultService';
import { XenditWebhookGuard } from './XenditWebhookGuard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecordLedgerDto } from '../../dto/vault.dto';

/**
 * VaultController - 金融接口层
 * 暴露账本记录、支付回调等核心金融接口。
 */
@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  /**
   * 记录订单账本 (内部调用或受限调用)
   */
  @UseGuards(JwtAuthGuard)
  @Post('ledger/:orderId')
  async recordLedger(
    @Param('orderId') orderId: string,
    @Body() data: RecordLedgerDto
  ) {
    return await this.vaultService.recordOrderLedger(orderId, data);
  }

  /**
   * Xendit 支付回调接口
   * 使用 XenditWebhookGuard 强制进行签名验证，确保回调真实性。
   */
  @Post('webhooks/xendit')
  @UseGuards(XenditWebhookGuard)
  async handleXenditWebhook(@Body() payload: any) {
    // 逻辑：解析支付状态，更新订单，触发 VaultService.handleChargeback (如果是退单)
    console.log('[VaultController] Received verified Xendit webhook:', payload);
    
    if (payload.event === 'payment.succeeded') {
      // 触发发货流程
    } else if (payload.event === 'payment.chargeback') {
      await this.vaultService.handleChargeback(payload.region_id, payload.amount);
    }

    return { status: 'SUCCESS' };
  }

  /**
   * 账户健康审计接口 (供后台看板使用)
   */
  @UseGuards(JwtAuthGuard)
  @Get('audit/:regionId')
  async getRegionAudit(@Param('regionId') regionId: string) {
    // 返回该区域的资损率、利润统计等
    return {
      regionId,
      status: 'SECURE',
      lastAudit: new Date(),
    };
  }

  /**
   * 金库三池余额汇总
   */
  @Get('summary')
  async summary() {
    const [marginPool, serviceFeePool, riskReserve] = await Promise.all([
      this.vaultService.getPoolBalance('MARGIN'),
      this.vaultService.getPoolBalance('SERVICE_FEE'),
      this.vaultService.getPoolBalance('RISK'),
    ]);
    return { marginPool, serviceFeePool, riskReserve };
  }
}
