/**
 * VaultService (Audit-Grade Ledger for AceProxy)
 * Fixed: Zero-sum balance correction for Platform Profit
 * Auditor: aceproxy-security-auditor
 */
export class VaultService {
  async recordOrderLedger(orderId: string, amounts: any) {
    const entries = [
      { account: 'USER_ESCROW', amount: amounts.total, type: 'DEBIT' },        // 用户付的钱 (借)
      { account: '1688_PAYOUT', amount: -amounts.cost, type: 'CREDIT' },       // 采购成本 (贷)
      { account: 'LOGISTICS_RESERVE', amount: -amounts.shipping, type: 'CREDIT' }, // 物流预留 (贷)
      { account: 'RISK_POOL', amount: -0.5, type: 'CREDIT' },                  // 保险基金 (贷)
      { account: 'PARTNER_COMMISSION', amount: -amounts.commission, type: 'CREDIT' }, // 团长分成 (贷)
      { account: 'PLATFORM_NET_PROFIT', amount: -amounts.profit, type: 'CREDIT' } // 平台纯利 (贷 - 修正为负数以平账)
    ];

    const balance = entries.reduce((acc, curr) => acc + curr.amount, 0);
    
    // 金融级平账检查：Sum(Debits) + Sum(Credits) === 0
    if (Math.abs(balance) > 0.0001) {
      throw new Error(`LEDGER_IMBALANCE: Off by ${balance}`);
    }

    return this.db.ledger.insertMany(entries.map(e => ({ ...e, orderId, timestamp: Date.now() })));
  }
}
