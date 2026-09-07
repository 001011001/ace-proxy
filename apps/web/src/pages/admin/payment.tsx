import { useApi } from '../../hooks/useApi';
import AdminLayout from '../../components/admin/AdminLayout';
import { DollarSign, CreditCard, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';

interface InvoiceRow { id: string; orderId: string; amount: string; status: string; method: string; createdAt: string; }
interface PaymentMethod { id: string; name: string; icon: string; }
interface ReconciliationRow { date: string; totalInvoices: number; totalAmount: string; successRate: string; }

/** 从字符串金额（如 "Rp 450,000"）提取数字 */
function parseAmount(s: string): number {
  const n = Number(s.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/** 格式化印尼盾 */
function formatRp(n: number): string {
  if (n === 0) return 'Rp 0';
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `Rp ${(n / 1e3).toFixed(1)}K`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

const STATUS_CONFIG: Record<string, { className: string; label: string; icon: React.ReactNode }> = {
  PAID: { className:'pill-tag-success', label:'已付款', icon:<CheckCircle2 size={12}/> },
  PENDING: { className:'pill-tag-warning', label:'待支付', icon:<Clock size={12}/> },
  EXPIRED: { className:'pill-tag-error', label:'已过期', icon:<XCircle size={12}/> },
  FAILED: { className:'pill-tag-error', label:'失败', icon:<AlertTriangle size={12}/> },
};

export default function PaymentPage() {
  const recon = useApi<ReconciliationRow[]>('/payment/reconciliation');
  const invoicesApi = useApi<any>('/payment/invoices');
  const [selectedTab, setSelectedTab] = useState<'invoices'|'reconciliation'|'methods'>('invoices');

  const reconData = (recon.data as any)?.length ? recon.data as unknown as ReconciliationRow[] : [];
  const invoices: InvoiceRow[] = (invoicesApi.data?.items || invoicesApi.data || []).length > 0
    ? (invoicesApi.data?.items || invoicesApi.data).map((inv: any) => ({
        id: inv.id || 'N/A',
        orderId: inv.orderId || '—',
        amount: inv.totalAmount ? `Rp ${Number(inv.totalAmount).toLocaleString()}` : (inv.amount || '—'),
        status: inv.status || 'PENDING',
        method: inv.method || inv.paymentMethod || '—',
        createdAt: inv.createdAt ? new Date(inv.createdAt).toLocaleString('id-ID') : '—',
      }))
    : [];
  const connected = !recon.error;

  return (
    <AdminLayout title="支付管理" actions={
      <span className={`pill-tag ${connected ? 'pill-tag-success' : 'pill-tag-warning'} !text-[10px]`}>
        {connected ? '已连接' : '待机'}
      </span>
    }>
      {/* Summary Cards — 从真实 API 数据聚合计算 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {(() => {
          const paidTotal = invoices
            .filter(i => i.status === 'PAID')
            .reduce((sum, i) => sum + parseAmount(i.amount), 0);
          const pendingCount = invoices.filter(i => i.status === 'PENDING').length;
          const successRate = invoices.length > 0
            ? `${Math.round((invoices.filter(i => i.status === 'PAID').length / invoices.length) * 100)}%`
            : '—';
          const methods = new Set(invoices.map(i => i.method).filter(Boolean));
          return [
            { label:'今日已收', value: formatRp(paidTotal), icon:<DollarSign size={18}/>, color:'text-success' },
            { label:'成功率', value: successRate, icon:<CheckCircle2 size={18}/>, color:'text-success' },
            { label:'待处理发票', value: String(pendingCount), icon:<Clock size={18}/>, color:'text-warning' },
            { label:'活跃方式', value: String(methods.size), icon:<CreditCard size={18}/>, color:'text-ocean' },
          ].map(c => (
            <div key={c.label} className="kpi-card flex items-center gap-4">
              <span className={c.color}>{c.icon}</span>
              <div>
                <div className="text-caption text-ink-mute">{c.label}</div>
                <div className="text-heading-md font-bold text-ink">{c.value}</div>
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-6">
        {(['invoices','reconciliation','methods'] as const).map(tab => (
          <button key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 text-sm font-display font-semibold transition-colors ${
              selectedTab===tab ? 'bg-terracotta text-white' : 'text-ink-secondary hover:bg-canvas-gray'
            }`}
          >
            {tab==='invoices' ? '发票' : tab==='reconciliation' ? '对账' : '支付方式'}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      {selectedTab==='invoices' && (
        <div className="card-feature">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header border-b border-hairline">
                  <th className="text-left py-2.5 px-3">Invoice ID</th>
                  <th className="text-left py-2.5 px-3">Order</th>
                  <th className="text-right py-2.5 px-3 tabular-nums">Amount</th>
                  <th className="text-left py-2.5 px-3">Method</th>
                  <th className="text-center py-2.5 px-3">Status</th>
                  <th className="text-right py-2.5 px-3">Time</th>
                  <th className="text-center py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length > 0 ? invoices.map(inv => {
                  const sc = STATUS_CONFIG[inv.status] || STATUS_CONFIG.PENDING;
                  return (
                    <tr key={inv.id} className="border-b border-hairline hover:bg-canvas-gray transition-colors">
                      <td className="py-3 px-3 text-body-sm font-mono text-ocean font-medium">{inv.id}</td>
                      <td className="py-3 px-3 text-body-sm">{inv.orderId}</td>
                      <td className="py-3 px-3 text-right text-body-sm tabular-nums font-semibold">{inv.amount}</td>
                      <td className="py-3 px-3 text-body-sm text-ink-secondary">{inv.method}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`${sc.className} inline-flex items-center gap-1`}>{sc.icon}{sc.label}</span>
                      </td>
                      <td className="py-3 px-3 text-right text-caption text-ink-mute">{inv.createdAt}</td>
                      <td className="py-3 px-3 text-center">
                        <button className="btn-ghost !text-xs !px-3 !py-1">详情</button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={7} className="py-8 text-center text-ink-mute text-body-sm">暂无发票 — 请连接支付网关</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {!connected && <div className="text-micro text-warning text-center mt-4">Backend offline — connect to see live data</div>}
        </div>
      )}

      {/* Reconciliation */}
      {selectedTab==='reconciliation' && (
        <div className="card-feature">
          <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
            <RefreshCw size={16}/> 每日对账
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header border-b border-hairline">
                  <th className="text-left py-2.5 px-3">日期</th>
                  <th className="text-right py-2.5 px-3">发票数</th>
                  <th className="text-right py-2.5 px-3">总金额</th>
                  <th className="text-center py-2.5 px-3">成功率</th>
                </tr>
              </thead>
              <tbody>
                {reconData.length > 0 ? reconData.map((r: ReconciliationRow) => (
                  <tr key={r.date} className="border-b border-hairline hover:bg-canvas-gray">
                    <td className="py-3 px-3 text-body-sm font-medium">{r.date}</td>
                    <td className="py-3 px-3 text-right text-body-sm tabular-nums">{r.totalInvoices}</td>
                    <td className="py-3 px-3 text-right text-body-sm tabular-nums font-semibold">{r.totalAmount}</td>
                    <td className="py-3 px-3 text-center"><span className="pill-tag-success">{r.successRate}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="py-8 text-center text-ink-mute text-body-sm">暂无对账数据 — 后端离线</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {selectedTab==='methods' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name:'Xendit 发票', desc:'印尼支付网关 · OVO/DANA/QRIS', status:'活跃' },
            { name:'银行转账', desc:'BCA/Mandiri/BNI 虚拟账户', status:'活跃' },
            { name:'Stripe', desc:'国际信用卡/借记卡', status:'活跃' },
            { name:'PayPal', desc:'全球 PayPal 结账', status:'待机' },
            { name:'钱包余额', desc:'AceProxy 金库内部支付', status:'活跃' },
            { name:'货到付款（即将上线）', desc:'雅加达地区货到付款', status:'规划中' },
          ].map(m => (
            <div key={m.name} className="card-feature">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-ink">{m.name}</h3>
                <span className={`pill-tag ${m.status==='Active' ? 'pill-tag-success' : m.status==='Standby' ? 'pill-tag-warning' : 'pill-tag-country'}`}>
                  {m.status}
                </span>
              </div>
              <p className="text-body-sm text-ink-secondary mb-3">{m.desc}</p>
              <button className="btn-ghost !text-xs">配置 →</button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
