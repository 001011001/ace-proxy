import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';

export default function FinancePage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [pnl, setPnl] = useState<any>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);

  useEffect(() => { fetchPnL(); fetchStations(); fetchCategories(); }, [year, month]);
  useEffect(() => { fetchTrend(); }, [year]);

  const fetchPnL = async () => {
    try {
      const res = await fetch(`/api/finance/pnl/monthly?year=${year}&month=${month}`);
      setPnl(await res.json());
    } catch { }
  };

  const fetchStations = async () => {
    try {
      const res = await fetch(`/api/finance/pnl/stations?year=${year}&month=${month}`);
      if (!res.ok) return;
      const json = await res.json();
      const items = Array.isArray(json) ? json : json?.data;
      setStations(Array.isArray(items) ? items : []);
    } catch { }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/finance/pnl/categories?year=${year}&month=${month}`);
      if (!res.ok) return;
      const json = await res.json();
      const items = Array.isArray(json) ? json : json?.data;
      setCategories(Array.isArray(items) ? items : []);
    } catch { }
  };

  const fetchTrend = async () => {
    try {
      const res = await fetch(`/api/finance/pnl/trend?year=${year}`);
      if (!res.ok) return;
      const json = await res.json();
      const items = Array.isArray(json) ? json : json?.data;
      setTrend(Array.isArray(items) ? items : []);
    } catch { }
  };

  const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

  const StatCard = ({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) => (
    <div className="card p-4">
      <p className="text-xs text-ink-mute mb-1">{label}</p>
      <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-ink-mute mt-1">{sub}</p>}
    </div>
  );

  return (
    <AdminLayout title="财务分析">
      {/* 时间选择 */}
      <div className="flex items-center gap-3 mb-6">
        <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="input-field !w-24 text-sm">
          {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}年</option>)}
        </select>
        <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="input-field !w-20 text-sm">
          {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <span className="text-sm text-ink-mute">月度 P&L 报表</span>
      </div>

      {/* KPI 卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="总营收" value={`¥${pnl?.totalRevenue?.toLocaleString() || '0'}`} color="text-ink" />
        <StatCard label="毛利" value={`¥${pnl?.grossProfit?.toLocaleString() || '0'}`} sub={`毛利率 ${pnl?.grossMargin || 0}%`} color="text-ocean" />
        <StatCard label="净利润" value={`¥${pnl?.netProfit?.toLocaleString() || '0'}`} sub={`净利率 ${pnl?.netMargin || 0}%`} color={pnl?.netProfit > 0 ? 'text-success' : 'text-danger'} />
        <StatCard label="总退款" value={`¥${pnl?.totalRefund?.toLocaleString() || '0'}`} color="text-terracotta" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 成本结构 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-heading-sm font-display font-semibold flex items-center gap-2">
              <PieChart size={18} className="text-ocean" /> 成本结构
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {pnl && [
              { label: '货源成本', value: pnl.totalCost, pct: pnl.totalRevenue > 0 ? (pnl.totalCost / pnl.totalRevenue * 100).toFixed(1) : 0, color: 'bg-ink' },
              { label: '运费', value: pnl.totalShipping, pct: pnl.totalRevenue > 0 ? (pnl.totalShipping / pnl.totalRevenue * 100).toFixed(1) : 0, color: 'bg-ocean' },
              { label: '服务费', value: pnl.totalServiceFee, pct: pnl.totalRevenue > 0 ? (pnl.totalServiceFee / pnl.totalRevenue * 100).toFixed(1) : 0, color: 'bg-terracotta' },
              { label: '佣金', value: pnl.totalCommission, pct: pnl.totalRevenue > 0 ? (pnl.totalCommission / pnl.totalRevenue * 100).toFixed(1) : 0, color: 'bg-accent' },
              { label: '退款', value: pnl.totalRefund, pct: pnl.totalRevenue > 0 ? (pnl.totalRefund / pnl.totalRevenue * 100).toFixed(1) : 0, color: 'bg-danger' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded ${item.color}`} />
                <span className="text-sm flex-1">{item.label}</span>
                <span className="text-sm font-mono">¥{item.value.toLocaleString()}</span>
                <span className="text-xs text-ink-mute w-12 text-right">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 分站损益 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-heading-sm font-display font-semibold flex items-center gap-2">
              <BarChart3 size={18} className="text-terracotta" /> 分站损益
            </h3>
          </div>
          <div className="px-5 pb-2">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-ink-mute"><th className="text-left py-2">站点</th><th className="text-right py-2">营收</th><th className="text-right py-2">毛利</th><th className="text-right py-2">净利润</th><th className="text-right py-2">订单</th></tr></thead>
              <tbody>
                {stations.map((s, i) => (
                  <tr key={i} className="border-t border-ink/5">
                    <td className="py-2 font-medium">{s.station}</td>
                    <td className="py-2 text-right font-mono">¥{s.revenue.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono text-ocean">¥{s.grossProfit.toLocaleString()}</td>
                    <td className={`py-2 text-right font-mono ${s.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>¥{s.netProfit.toLocaleString()}</td>
                    <td className="py-2 text-right">{s.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 品类损益 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-heading-sm font-display font-semibold flex items-center gap-2">
              <PieChart size={18} className="text-accent" /> 分品类损益
            </h3>
          </div>
          <div className="px-5 pb-2">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-ink-mute"><th className="text-left py-2">品类</th><th className="text-right py-2">营收</th><th className="text-right py-2">毛利</th><th className="text-right py-2">销量</th></tr></thead>
              <tbody>
                {categories.slice(0, 10).map((c, i) => (
                  <tr key={i} className="border-t border-ink/5">
                    <td className="py-2 font-medium">{c.category}</td>
                    <td className="py-2 text-right font-mono">¥{c.revenue.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono text-ocean">¥{c.grossProfit.toLocaleString()}</td>
                    <td className="py-2 text-right">{c.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 年度趋势 */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-heading-sm font-display font-semibold flex items-center gap-2">
              <TrendingUp size={18} className="text-success" /> 年度趋势
            </h3>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-1 h-40">
              {trend.map((m: any, i: number) => {
                const maxRev = Math.max(...trend.map((t: any) => t.totalRevenue || 0), 1);
                const h = ((m.totalRevenue || 0) / maxRev) * 100;
                const isCurrent = m.month === `${year}-${String(month).padStart(2, '0')}`;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-ink-mute">{months[i]}</span>
                    <div className={`w-full ${isCurrent ? 'bg-terracotta' : 'bg-ocean/30'}`}
                      style={{ height: `${Math.max(h, 2)}%` }} title={`¥${(m.totalRevenue || 0).toLocaleString()}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
