import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Users, Star, Clock, AlertTriangle, Search, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

interface SupplierRow {
  id: string; name: string; source: string; ltc: string; qcRate: string;
  resaleRate: string; score: number; status: 'active'|'warning'|'blacklisted';
}

const statusConfig: Record<string,{cls:string;label:string}> = {
  active: { cls:'pill-tag-success', label:'Active' },
  warning: { cls:'pill-tag-warning', label:'Warning' },
  blacklisted: { cls:'pill-tag-error', label:'Blacklisted' },
};

const scoreColor = (s: number) => s>=4.5 ? 'text-success' : s>=3.5 ? 'text-warning' : 'text-error';

function mapSupplier(s: any): SupplierRow {
  const score = Number(s.score || 4.0);
  let status: SupplierRow['status'] = 'active';
  if (s.isBlacklisted || s.status === 'BLACKLISTED') status = 'blacklisted';
  else if (score < 3.5 || s.status === 'WARNING') status = 'warning';

  return {
    id: s.id || s.supplierId || 'N/A',
    name: s.name || 'Unknown',
    source: s.source || s.platform || '1688',
    ltc: s.avgLeadTimeHrs ? `${s.avgLeadTimeHrs}h` : `${s.ltc || '3.5 days'}`,
    qcRate: s.defectRate != null ? `${(Number(s.defectRate)*100).toFixed(1)}%` : (s.qcRate || '—'),
    resaleRate: s.resaleRejectionRate != null ? `${(Number(s.resaleRejectionRate)*100).toFixed(1)}%` : (s.resaleRate || '—'),
    score: Number(score),
    status,
  };
}

export default function SuppliersPage() {
  const [filter, setFilter] = useState('all');

  const rulesApi = useApi<any>('/supplier/red-line-rules');
  const supplierListApi = useApi<any>('/supplier/list');
  const loading = rulesApi.loading || supplierListApi.loading;
  const error = rulesApi.error || supplierListApi.error;

  const apiSuppliers = supplierListApi.data?.suppliers || supplierListApi.data || [];
  const suppliers: SupplierRow[] = Array.isArray(apiSuppliers) && apiSuppliers.length > 0
    ? apiSuppliers.map(mapSupplier)
    : [];

  const filtered = filter==='all' ? suppliers : suppliers.filter(s=>s.status===filter);

  // 从真实数据计算平均值
  const avg = (() => {
    if (suppliers.length === 0) return { ltc: '—', qcRate: '—', resaleRate: '—' };
    const validLtc = suppliers.filter(s => s.ltc.match(/[\d.]+/));
    const avgLtcHrs = validLtc.length > 0
      ? suppliers.reduce((sum, s) => {
          const m = s.ltc.match(/([\d.]+)/);
          return sum + (m ? Number(m[1]) : 0);
        }, 0) / validLtc.length
      : 0;
    const avgQc = suppliers.filter(s => s.qcRate !== '—').length > 0
      ? suppliers.reduce((sum, s) => {
          const m = s.qcRate.match(/([\d.]+)/);
          return sum + (m ? Number(m[1]) : 0);
        }, 0) / suppliers.filter(s => s.qcRate !== '—').length
      : 0;
    const avgResale = suppliers.filter(s => s.resaleRate !== '—').length > 0
      ? suppliers.reduce((sum, s) => {
          const m = s.resaleRate.match(/([\d.]+)/);
          return sum + (m ? Number(m[1]) : 0);
        }, 0) / suppliers.filter(s => s.resaleRate !== '—').length
      : 0;
    return {
      ltc: avgLtcHrs >= 1 ? `${avgLtcHrs.toFixed(1)}h` : '—',
      qcRate: avgQc > 0 ? `${avgQc.toFixed(1)}%` : '—',
      resaleRate: avgResale > 0 ? `${avgResale.toFixed(1)}%` : '—',
    };
  })();

  return (
    <AdminLayout title="供应商管理" actions={
      error && <span className="pill-tag-warning !text-[10px]">API 离线</span>
    }>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-terracotta" />
          <span className="ml-2 text-ink-mute">加载供应商数据...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Scorecard Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {[
              { label:'Avg LTC (Lead Time)', value:avg.ltc, icon:<Clock size={18}/>, cls:'text-ocean' },
              { label:'Avg QC Reject Rate', value:avg.qcRate, icon:<AlertTriangle size={18}/>, cls:'text-warning' },
              { label:'Avg Resale Rate', value:avg.resaleRate, icon:<Users size={18}/>, cls:'text-success' },
            ].map(c => (
              <div key={c.label} className="kpi-card flex items-center gap-4">
                <span className={c.cls}>{c.icon}</span>
                <div>
                  <div className="text-caption text-ink-mute">{c.label}</div>
                  <div className="text-heading-md font-bold">{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Red Line Rules (from API) */}
          {rulesApi.data && (
            <div className="card-feature mb-6 border-warning/20 bg-warning-soft/10">
              <h3 className="text-heading-sm font-display text-ink mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-warning"/> 供应商红线规则
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-body-sm">
                {(rulesApi.data?.rules || []).map((r: any, i: number) => (
                  <div key={i} className="bg-canvas-gray p-3">
                    <div className="font-semibold text-ink mb-1">{r.name}: {r.threshold}</div>
                    <div className="text-ink-muted">{r.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter + Table */}
          <div className="card-feature">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex gap-2">
                {(['all','active','warning','blacklisted'] as const).map(f => (
                  <button key={f} onClick={()=>setFilter(f)}
                    className={`px-4 py-1.5 text-xs font-display font-semibold transition-colors ${
                      filter===f ? 'bg-terracotta text-white' : 'text-ink-secondary hover:bg-canvas-gray'
                    }`}>{f==='all'?'全部':f==='active'?'活跃':f==='warning'?'警告':'已拉黑'}</button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header border-b border-hairline">
                    <th className="text-left py-2.5 px-3">Supplier</th>
                    <th className="text-left py-2.5 px-3">Source</th>
                    <th className="text-center py-2.5 px-3">LTC</th>
                    <th className="text-center py-2.5 px-3">QC Reject</th>
                    <th className="text-center py-2.5 px-3">Resale</th>
                    <th className="text-center py-2.5 px-3">Score</th>
                    <th className="text-center py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const sc = statusConfig[s.status];
                    return (
                      <tr key={s.id || i} className="border-b border-hairline hover:bg-canvas-gray">
                        <td className="py-3 px-3">
                          <div className="font-medium text-body-sm">{s.name}</div>
                          <div className="text-micro text-ink-mute">{s.id}</div>
                        </td>
                        <td className="py-3 px-3 text-body-sm text-ocean font-medium">{s.source}</td>
                        <td className="py-3 px-3 text-center text-body-sm tabular-nums">{s.ltc}</td>
                        <td className="py-3 px-3 text-center text-body-sm tabular-nums">{s.qcRate}</td>
                        <td className="py-3 px-3 text-center text-body-sm tabular-nums">{s.resaleRate}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-body-sm font-bold tabular-nums ${scoreColor(s.score)}`}>
                            <Star size={12} className="inline mr-1"/>{s.score.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center"><span className={sc.cls}>{sc.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-ink-mute text-body-sm">暂无供应商</div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
