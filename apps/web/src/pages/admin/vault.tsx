import { useApi } from '../../hooks/useApi';
import AdminLayout from '../../components/admin/AdminLayout';
import { Landmark, DollarSign, Shield, TrendingUp, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';

interface PoolBalance { pool: string; balance: string; status: 'healthy'|'warning'|'danger'; }
interface LedgerEntry { orderId: string; type: string; amount: string; balance: string; time: string; }

const DEFAULT_POOLS: PoolBalance[] = [
  { pool:'风险储备池', balance:'Rp 18,500,000', status:'healthy' },
  { pool:'平台利润池', balance:'Rp 156,800,000', status:'healthy' },
  { pool:'拒付锁定池', balance:'Rp 3,200,000', status:'warning' },
  { pool:'合作伙伴佣金池', balance:'Rp 8,400,000', status:'healthy' },
];

const DEFAULT_LEDGER: LedgerEntry[] = [
  { orderId:'#ORD-0842', type:'订单营收', amount:'+Rp 98,000', balance:'Rp 156,898K', time:'10:45' },
  { orderId:'#ORD-0843', type:'支付冻结', amount:'-Rp 280,000', balance:'Rp 156,618K', time:'10:30' },
  { orderId:'#ORD-0844', type:'服务费', amount:'+Rp 22,500', balance:'Rp 156,640K', time:'09:15' },
  { orderId:'#ORD-0841', type:'退款', amount:'-Rp 45,000', balance:'Rp 156,595K', time:'08:20' },
  { orderId:'#ORD-0840', type:'合作方结算', amount:'-Rp 120,000', balance:'Rp 156,475K', time:'07:00' },
  { orderId:'#ORD-0839', type:'订单营收', amount:'+Rp 350,000', balance:'Rp 156,825K', time:'06:45' },
];

const DEFAULT_FUND_FLOW = [
  { stage:'海外', amount:'¥32,000', pct:32, color:'bg-ocean' },
  { stage:'外汇结算', amount:'¥45,000', pct:45, color:'bg-warning' },
  { stage:'已结算', amount:'¥23,000', pct:23, color:'bg-success' },
];

function formatIDR(amount: number): string {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}K`;
  return `Rp ${amount.toLocaleString()}`;
}

export default function VaultPage() {
  const vault = useApi('/vault/summary');
  const profit = useApi('/dashboard/profit/snapshot');
  const connected = !vault.error;

  // Use real API data when available, fallback to defaults
  const vaultData = vault.data;
  const profitData = profit.data;

  const pools: PoolBalance[] = (vaultData?.pools && vaultData.pools.length > 0)
    ? vaultData.pools
    : [];

  // Map API ledger entries to UI format
  const apiLedger = vaultData?.ledger || vaultData?.entries || [];
  const ledger: LedgerEntry[] = Array.isArray(apiLedger) && apiLedger.length > 0
    ? apiLedger.map((e: any, i: number) => ({
        orderId: e.orderId || `#ORD-${String(8400 + i)}`,
        type: e.type || e.entryType || 'Transaction',
        amount: e.amount != null
          ? (Number(e.amount) >= 0 ? `+Rp ${Number(e.amount).toLocaleString()}` : `-Rp ${Math.abs(Number(e.amount)).toLocaleString()}`)
          : '—',
        balance: formatIDR(e.balance || 0),
        time: e.time || e.createdAt?.slice(11, 16) || '—',
      }))
    : [];

  // Profit KPI from API
  const profitKPI = profitData || {};

  return (
    <AdminLayout title="金库与财务" actions={
      <span className={`pill-tag ${connected ? 'pill-tag-success' : 'pill-tag-warning'} !text-[10px]`}>
        {connected ? '实时' : '缓存'}
      </span>
    }>
      {/* Pool Balances - use API data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {pools.map(p => (
          <div key={p.pool} className={`kpi-card ${p.status==='warning' ? 'kpi-card-highlight' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              {p.status==='warning' ? <AlertTriangle size={15} className="text-warning"/> : <Landmark size={15} className="text-ink-mute"/>}
              <span className="text-caption text-ink-mute uppercase tracking-wider">{p.pool}</span>
            </div>
            <div className="text-heading-lg font-bold tabular-nums text-ink">{p.balance}</div>
          </div>
        ))}
      </div>

      {/* Fund Flow + Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Ledger - uses real API data */}
        <div className="lg:col-span-2 card-feature">
          <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
            <RefreshCw size={16}/> 最近流水
            {connected && vaultData && <span className="pill-tag-success !text-[10px]">实时数据</span>}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header border-b border-hairline">
                  <th className="text-left py-2.5 px-3">Order</th>
                  <th className="text-left py-2.5 px-3">Type</th>
                  <th className="text-right py-2.5 px-3 tabular-nums">Amount</th>
                  <th className="text-right py-2.5 px-3 tabular-nums">Balance</th>
                  <th className="text-right py-2.5 px-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map(e => (
                  <tr key={e.orderId+e.time} className="border-b border-hairline hover:bg-canvas-gray">
                    <td className="py-3 px-3 text-body-sm font-mono font-medium text-ocean">{e.orderId}</td>
                    <td className="py-3 px-3 text-body-sm text-ink-secondary">{e.type}</td>
                    <td className={`py-3 px-3 text-right text-body-sm tabular-nums font-semibold ${e.amount.startsWith('+') ? 'text-success' : 'text-error'}`}>{e.amount}</td>
                    <td className="py-3 px-3 text-right text-body-sm tabular-nums">{e.balance}</td>
                    <td className="py-3 px-3 text-right text-caption text-ink-mute">{e.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fund Flow Progress */}
        <div className="card-feature">
          <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
            <TrendingUp size={16}/> 资金回流
          </h2>
          <div className="space-y-4">
            {(profitData?.fundFlow && profitData.fundFlow.length > 0
              ? profitData.fundFlow
              : []
            ).map((f: any) => (
              <div key={f.stage}>
                <div className="flex justify-between text-body-sm mb-1">
                  <span className="text-ink-secondary">{f.stage}</span>
                  <span className="font-semibold tabular-nums">{f.amount} ({f.pct}%)</span>
                </div>
                <div className="h-2 bg-canvas-gray overflow-hidden">
                  <div className={`h-full ${f.color || 'bg-ocean'} transition-all`} style={{width:`${(f.pct||0)*2.5}%`}}/>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-hairline">
            <h3 className="text-body-sm font-semibold text-ink mb-2">外汇缓冲配置</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label:'IDR 缓冲', value:'8%' },
                { label:'THB 缓冲', value:'6%' },
                { label:'PHP 缓冲', value:'6%' },
                { label:'BRL 缓冲', value:'5%' },
              ].map(fx => (
                <div key={fx.label} className="bg-canvas-gray p-3 text-center">
                  <div className="text-micro text-ink-mute">{fx.label}</div>
                  <div className="text-body-sm font-bold">{fx.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Meltdown Circuit */}
      <div className="card-feature">
        <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
          <Shield size={16} className="text-error"/> Risk Meltdown Circuit
          {connected && vaultData?.riskRatio != null && (
            <span className="pill-tag-success !text-[10px]">Live</span>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-canvas-gray p-4">
            <div className="text-body-sm font-semibold text-ink mb-3">当前风险比率</div>
            <div className={`text-display-md font-bold ${vaultData?.riskRatio != null && vaultData.riskRatio >= 4.5 ? 'text-warning' : 'text-success'}`}>
              {vaultData?.riskRatio != null ? `${vaultData.riskRatio}%` : '—'}
            </div>
            <div className="text-caption text-ink-mute mt-1">
              阈值: 5.0% — 状态: {vaultData?.riskRatio == null ? '—' : vaultData.riskRatio >= 5.0 ? '🔴 已触发' : vaultData.riskRatio >= 4.5 ? '⚠ 接近中' : '✅ 正常'}
            </div>
            <div className="mt-3 h-2 bg-canvas overflow-hidden">
              <div
                className={`h-full ${vaultData?.riskRatio != null && vaultData.riskRatio >= 5.0 ? 'bg-error' : 'bg-warning'}`}
                style={{width:`${vaultData?.riskRatio != null ? Math.min((vaultData.riskRatio / 5) * 100, 100) : 0}%`}}
            />
            </div>
          </div>
          <div className="bg-canvas-gray p-4">
            <div className="text-body-sm font-semibold text-ink mb-3">自动防御规则</div>
            <ul className="space-y-2 text-body-sm text-ink-secondary">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-error shrink-0"/> 5.0% 时自动冻结支付</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-warning shrink-0"/> 4.5% 时告警管理员</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-success shrink-0"/> 低于 3.0% 时自动恢复</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-ocean shrink-0"/> 每日 00:00 WIB 自动对账</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
