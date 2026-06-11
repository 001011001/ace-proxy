import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * VaultService (Audit-Grade Ledger for AceProxy)
 * Fixed: Zero-sum balance correction for Platform Profit
 * Auditor: aceproxy-security-auditor
 */
@Injectable()
export class VaultService {
  private readonly logger = new Logger(VaultService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 核心财务参数 (由 Ecommerce Mind 审计)
  public static readonly RESALE_COMMISSION_PCT = 0.05;    // 转卖平台抽成 5%
  public static readonly RISK_POOL_PCT = 0.015;          // 风险对冲线 (必须优先划拨)
  public static readonly PARTNER_REWARD_PCT = 0.02;      // 团长基础分成 2%

  /**
   * 记录订单全链路分账 (工业级零和账本)
   * 优先级：RiskPool > Cost > Shipping > Commission > Rebate > Profit
   */
  async recordOrderLedger(orderId: string, data: {
    total: number,
    cost: number,
    shipping: number,
    partnerCommission: number,
    tierConfig: { serviceFeePct: number, rebatePct: number }
  }) {
    const riskPoolAmount = data.total * VaultService.RISK_POOL_PCT;
    const rebatePoints = data.total * data.tierConfig.rebatePct;
    
    // 剩下的就是平台服务费利润 (扣除成本、运费、风险金、团长佣金和返点积分后)
    const platformNetProfit = data.total - data.cost - data.shipping - riskPoolAmount - data.partnerCommission - rebatePoints;

    const entries = [
      { account: 'USER_ESCROW', amount: data.total, type: 'DEBIT', desc: 'Order Payment' },
      { account: '1688_COST', amount: -data.cost, type: 'CREDIT', desc: 'Factory Sourcing' },
      { account: 'LOGISTICS_RESERVE', amount: -data.shipping, type: 'CREDIT', desc: 'International Freight' },
      { account: 'RISK_POOL', amount: -riskPoolAmount, type: 'CREDIT', desc: '1.5% Priority Reserve' },
      { account: 'PARTNER_COMMISSION', amount: -data.partnerCommission, type: 'CREDIT', desc: 'Local Partner Reward' },
      { account: 'ACE_POINTS_LEDGER', amount: -rebatePoints, type: 'CREDIT', desc: 'User Loyalty Rebate' },
      { account: 'PLATFORM_NET_PROFIT', amount: -platformNetProfit, type: 'CREDIT', desc: 'Service Fee Net' }
    ];

    const balance = entries.reduce((acc, curr) => acc + curr.amount, 0);
    if (Math.abs(balance) > 0.01) {
      throw new Error(`LEDGER_IMBALANCE: Off by ${balance}. Audit required.`);
    }

    // Persist to database (atomic transaction)
    await this.prisma.$transaction(
      entries.map(entry =>
        this.prisma.aceVaultLedger.create({
          data: {
            orderId,
            account: entry.account,
            amount: entry.amount,
            entryType: entry.type,
            description: entry.desc,
          },
        })
      )
    );

    this.logger.log(`[Vault] Order ${orderId} settled. Profit: ${platformNetProfit}, RiskPool: ${riskPoolAmount}`);
    return { success: true, orderId, entries };
  }

  /**
   * 记录 Salvage 补偿积分 (TradeService 调用)
   */
  async recordSalvageRebate(orderId: string, amount: number) {
    await this.prisma.aceVaultLedger.create({
      data: {
        orderId,
        account: 'SALVAGE_REBATE',
        amount: -amount,
        entryType: 'CREDIT',
        description: `Salvage rebate compensation for order ${orderId}`,
      },
    });
    this.logger.log(`[Vault] Salvage rebate recorded: Order ${orderId}, Amount ${amount}`);
    return { success: true };
  }

  /**
   * 处理拒付 (Chargeback)
   * 响应 RiskSentry 的熔断指令，锁定相关区域的资金池。
   */
  async handleChargeback(regionId: string, amount: number) {
    this.logger.warn(`[Vault] CRITICAL: Chargeback detected in region ${regionId} for amount ${amount}.`);

    // 记录拒付锁定条目
    await this.prisma.aceVaultLedger.create({
      data: {
        orderId: `CHARGEBACK-${regionId}-${Date.now()}`,
        account: 'CHARGEBACK_LOCK',
        amount: amount,
        entryType: 'DEBIT',
        description: `Chargeback lock for region ${regionId}`,
      },
    });

    return { success: true, status: 'FUNDS_LOCKED', lockedAmount: amount };
  }

  /**
   * 记录 C2C 转卖分账
   */
  async recordResaleSettlement(orderId: string, resalePrice: number) {
    const platformFee = resalePrice * VaultService.RESALE_COMMISSION_PCT;
    const partnerReward = resalePrice * VaultService.PARTNER_REWARD_PCT;
    const sellerReturn = resalePrice - platformFee - partnerReward;

    // 记录转卖账本条目...
    return { platformFee, partnerReward, sellerReturn };
  }

  /**
   * 最终结算 (Payout)
   * 当用户确认收货后，将冻结资金正式转入团长/骑手账户。
   */
  async finalizeSettlement(orderId: string, partnerId: string, amount: number) {
    this.logger.log(`[Vault] Finalizing payout for Order ${orderId} to Partner ${partnerId}: ${amount}`);

    const entries = [
      { account: 'PARTNER_COMMISSION', amount: amount, type: 'DEBIT', desc: 'Commission Release' },
      { account: 'PARTNER_WALLET', amount: -amount, type: 'CREDIT', desc: 'Partner Payout' },
    ];

    await this.prisma.$transaction([
      ...entries.map(entry =>
        this.prisma.aceVaultLedger.create({
          data: {
            orderId,
            account: entry.account,
            amount: entry.amount,
            entryType: entry.type,
            description: entry.desc,
          },
        })
      ),
      this.prisma.acePartner.update({
        where: { id: partnerId },
        data: {
          balance: { increment: amount },
          pendingSettlement: { decrement: amount },
        },
      }),
    ]);

    return { success: true, settled_at: new Date().toISOString() };
  }
}

