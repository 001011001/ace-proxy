import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { VaultService } from '../vault/VaultService';

/**
 * ReconciliationCronService — 自动对账定时任务
 *
 * 负责：
 * 1. 每日金库账本平衡审计（Zero-Sum Verification）
 * 2. 订单结算状态同步（PAID→SETTLED）
 * 3. 合伙人待结算余额自动打款
 * 4. 风险池超额预警
 */
@Injectable()
export class ReconciliationCronService {
  private readonly logger = new Logger(ReconciliationCronService.name);

  // 风险阈值
  private static readonly RISK_POOL_ALERT_PCT = 0.05; // 风险池占比超过总流水 5% 告警
  private static readonly CHARGEBACK_ALERT_COUNT = 10; // 拒付数量超过 10 笔告警

  constructor(
    private readonly prisma: PrismaService,
    private readonly vaultService: VaultService,
    private readonly config: ConfigService,
  ) {}

  /**
   * 每日凌晨 2:00 — 金库全量对账
   * 验证所有账本条目的 DEBIT + CREDIT = 0（零和）
   */
  @Cron('0 2 * * *')
  async dailyFullReconciliation() {
    this.logger.log('[Reconciliation] Starting daily full ledger audit...');

    const startTime = Date.now();
    const report: string[] = [];

    try {
      // 1. 按 orderId 分组检查每个订单的零和平衡
      const orderGroups = await this.prisma.aceVaultLedger.groupBy({
        by: ['orderId'],
        _sum: { amount: true },
      });

      let imbalanceCount = 0;
      for (const group of orderGroups) {
        const balance = Number(group._sum.amount || 0);
        if (Math.abs(balance) > 0.01) {
          imbalanceCount++;
          this.logger.error(`[Reconciliation] IMBALANCE: Order ${group.orderId} off by ${balance.toFixed(4)}`);
          report.push(`⚠️ Order ${group.orderId}: imbalance ${balance.toFixed(4)}`);
        }
      }

      // 2. 按账户类型汇总
      const accountSums = await this.prisma.aceVaultLedger.groupBy({
        by: ['account'],
        _sum: { amount: true },
      });

      report.push(`\n## Account Balances`);
      for (const acc of accountSums) {
        const sum = Number(acc._sum.amount || 0).toFixed(2);
        report.push(`- ${acc.account}: ${sum}`);
      }

      // 3. 风险池审计
      const riskPool = accountSums.find(a => a.account === 'RISK_POOL');
      const totalDebit = accountSums
        .filter(a => !a.account.includes('CREDIT'))
        .reduce((s, a) => s + Math.abs(Number(a._sum.amount || 0)), 0);

      if (riskPool && totalDebit > 0) {
        const riskRatio = Math.abs(Number(riskPool._sum.amount || 0)) / totalDebit;
        if (riskRatio > ReconciliationCronService.RISK_POOL_ALERT_PCT) {
          report.push(`\n🚨 RISK_POOL_ALERT: Risk pool ratio ${(riskRatio * 100).toFixed(1)}% exceeds ${(ReconciliationCronService.RISK_POOL_ALERT_PCT * 100)}%`);
          this.logger.warn(`[Reconciliation] Risk pool alert: ${(riskRatio * 100).toFixed(1)}%`);
        }
      }

      // 4. 拒付统计
      const chargebackCount = await this.prisma.aceVaultLedger.count({
        where: { account: 'CHARGEBACK_LOCK' },
      });
      if (chargebackCount >= ReconciliationCronService.CHARGEBACK_ALERT_COUNT) {
        report.push(`\n🚨 CHARGEBACK_ALERT: ${chargebackCount} chargebacks detected!`);
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      report.unshift(`## Daily Reconciliation Report — ${new Date().toISOString().slice(0, 10)}`);
      report.push(`\n---\n✅ Checked ${orderGroups.length} orders | ⚠️ ${imbalanceCount} imbalances | ⏱ ${duration}s`);

      this.logger.log(`[Reconciliation] Complete: ${orderGroups.length} orders, ${imbalanceCount} imbalances`);
    } catch (e) {
      this.logger.error(`[Reconciliation] FAILED: ${e}`);
      report.push(`❌ Reconciliation failed: ${e}`);
    }

    return report.join('\n');
  }

  /**
   * 每 30 分钟 — 订单状态同步
   * 将已确认收货的 PAID 订单转为 SETTLED
   */
  @Cron('*/30 * * * *')
  async syncOrderSettlement() {
    this.logger.log('[Reconciliation] Syncing order settlements...');

    // 查找 72 小时前已支付且未结算的订单
    const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000);
    const pendingOrders = await this.prisma.aceOrder.findMany({
      where: {
        status: 'PAID',
        createdAt: { lt: cutoff },
      },
      select: { id: true, totalAmount: true, userId: true },
    });

    let settled = 0;
    for (const order of pendingOrders) {
      try {
        // 更新订单状态
        await this.prisma.aceOrder.update({
          where: { id: order.id },
          data: { status: 'SETTLED' },
        });

        // 记录结算账本条目
        await this.prisma.aceVaultLedger.create({
          data: {
            orderId: order.id,
            account: 'SETTLEMENT_FINAL',
            amount: -Number(order.totalAmount),
            entryType: 'CREDIT',
            description: `Auto-settlement for order ${order.id}`,
          },
        });

        settled++;
      } catch (e) {
        this.logger.warn(`[Reconciliation] Failed to settle order ${order.id}: ${e}`);
      }
    }

    if (settled > 0) {
      this.logger.log(`[Reconciliation] Auto-settled ${settled} orders`);
    }
  }

  /**
   * 每天凌晨 4:00 — 合伙人自动打款
   * 将 pendingSettlement > 0 的合伙人余额打入 balance
   */
  @Cron('0 4 * * *')
  async autoPayoutPartners() {
    this.logger.log('[Reconciliation] Processing partner payouts...');

    const partners = await this.prisma.acePartner.findMany({
      where: {
        pendingSettlement: { gt: 0 },
        status: 'ACTIVE',
      },
    });

    let payoutCount = 0;
    let totalPayout = 0;

    for (const partner of partners) {
      try {
        const amount = Number(partner.pendingSettlement);

        // 使用 VaultService 的 finalizeSettlement
        await this.vaultService.finalizeSettlement(
          `PAYOUT-${partner.id}-${Date.now()}`,
          partner.id,
          amount,
        );

        totalPayout += amount;
        payoutCount++;
        this.logger.log(`[Reconciliation] Payout: Partner ${partner.id} — ${amount}`);
      } catch (e) {
        this.logger.error(`[Reconciliation] Payout failed for partner ${partner.id}: ${e}`);
      }
    }

    this.logger.log(`[Reconciliation] Payout complete: ${payoutCount} partners, total ${totalPayout}`);
  }

  /**
   * 每天凌晨 1:00 — 过期订单清理（超过 30 天未结算）
   */
  @Cron('0 1 * * *')
  async cleanupStaleOrders() {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await this.prisma.aceOrder.updateMany({
      where: {
        status: { in: ['PAID', 'PENDING'] },
        createdAt: { lt: cutoff },
      },
      data: { status: 'EXPIRED' },
    });

    if (result.count > 0) {
      this.logger.log(`[Reconciliation] Cleaned up ${result.count} stale orders (> 30 days)`);
    }
  }

  /**
   * 手动触发对账（通过 Controller 调用）
   */
  async manualReconciliation() {
    return this.dailyFullReconciliation();
  }

  /**
   * 获取对账摘要
   */
  async getReconciliationSummary() {
    const [totalOrders, totalLedgerEntries, partnerCount, riskPoolBalance] = await Promise.all([
      this.prisma.aceOrder.count(),
      this.prisma.aceVaultLedger.count(),
      this.prisma.acePartner.count({ where: { status: 'ACTIVE' } }),
      this.vaultService.getPoolBalance('RISK_POOL'),
    ]);

    return {
      totalOrders,
      totalLedgerEntries,
      activePartners: partnerCount,
      riskPoolBalance,
      lastReconciliation: new Date().toISOString(),
    };
  }
}
