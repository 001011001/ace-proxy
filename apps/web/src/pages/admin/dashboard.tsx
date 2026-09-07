import { useApi } from '../../hooks/useApi';
import AdminLayout from '../../components/admin/AdminLayout';
import { DollarSign, Package, TrendingUp, Shield, ArrowUpRight, ArrowDownRight, AlertTriangle, AlertCircle, Info, Globe, Loader2 } from 'lucide-react';

interface TrendItem { date: string; gmv: number; orders: number; }
interface AlertItem { id: string; type: 'warning'|'danger'|'info'; message: string; time: string; severity?: string; }
interface CountryItem { country: string; orders: number; gmv: number; }
interface ProfitSnapshot { margin: string; revenue: string; todayGmv: string; totalProfit: string; refundRate: number; }
interface PoolItem { pool: string; balance: string; status: string; }

// ═══════════════════════════════════════════
//  后端 /dashboard/kpi 返回的真实数据结构
// ═══════════════════════════════════════════
interface BackendKpi {
  todayGmv: number;
  monthGmv: number;
  totalGmv: number;
  netMargin: number;
  totalProfit: number;
  totalCost: number;
  totalShipping: number;
  totalService: number;
  totalProducts: number;
  activeUsers: number;
  totalOrders: number;
  todayOrders: number;
  orderBreakdown: { paid: number; shipped: number; delivered: number; cancelled: number; pending: number; };
  refundRate: number;
  totalRefund: number;
  topProducts: { productId: string; name: string; category: string; orderCount: number; totalQty: number; }[];
}

/** 数字格式化：Rp 123456 → Rp 123.5K / Rp 1.2M / Rp 1.28B */
function formatRp(n: number): string {
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `Rp ${(n / 1e3).toFixed(1)}K`;
  return `Rp ${n.toLocaleString()}`;
}

/** 趋势柱状图的最大值归一化 */
function normalizeTrend(data: TrendItem[]): { max: number; bars: { date: string; gmv: number; pct: number; label: string }[] } {
  const max = Math.max(...data.map(d => d.gmv), 1);
  const bars = data.map(d => ({
    date: d.date.slice(5),
    gmv: d.gmv,
    pct: d.gmv / max,
    label: d.date.slice(8, 10) || d.date.slice(5),
  }));
  return { max, bars };
}

export default function Dashboard() {
  // ── API calls ──
  const kpi = useApi<BackendKpi>('/dashboard/kpi');
  const trend = useApi<TrendItem[]>('/dashboard/trend');
  const countries = useApi<CountryItem[]>('/dashboard/country-breakdown');
  const risk = useApi<{ alerts: AlertItem[] }>('/risk-sentry/alerts');
  const profit = useApi<ProfitSnapshot>('/dashboard/profit/snapshot');
  const pools = useApi<{ pools: PoolItem[] }>('/dashboard/pool/balances');

  // ── Derived data ──
  const kpiData = kpi.data;
  const trendData = trend.data && trend.data.length > 0 ? normalizeTrend(trend.data) : null;
  const countryData = countries.data && countries.data.length > 0
    ? countries.data.map(c => ({
        country: c.country || 'Unknown',
        orders: c.orders,
        revenue: formatRp(c.gmv),
        growth: '—',
      }))
    : null;
  const alerts = (risk.data as any)?.alerts || [];
  const poolItems = pools.data?.pools || [];

  const allLoading = kpi.loading || trend.loading || countries.loading;

  // ── KPI Cards ──
  const KPIS = kpiData ? [
    { label: '月 GMV', value: formatRp(kpiData.monthGmv), change: '—', up: true, icon: <DollarSign size={20}/> },
    { label: '今日订单', value: String(kpiData.todayOrders), change: '—', up: true, icon: <Package size={20}/> },
    { label: '净利润率', value: `${kpiData.netMargin}%`, change: '—', up: kpiData.netMargin > 15, icon: <TrendingUp size={20}/> },
    { label: '退款率', value: `${kpiData.refundRate}%`, change: '—', up: false, icon: <Shield size={20}/> },
  ] : [
    { label: '月 GMV', value: '—', change: '—', up: true, icon: <DollarSign size={20}/> },
    { label: '今日订单', value: '—', change: '—', up: true, icon: <Package size={20}/> },
    { label: '净利润率', value: '—', change: '—', up: true, icon: <TrendingUp size={20}/> },
    { label: '退款率', value: '—', change: '—', up: false, icon: <Shield size={20}/> },
  ];

  const alertIcon = (t: string) => {
    if (t==='danger' || t==='CRITICAL' || t==='HIGH') return <AlertCircle size={15} className="text-error shrink-0 mt-0.5"/>;
    if (t==='warning' || t==='MEDIUM') return <AlertTriangle size={15} className="text-warning shrink-0 mt-0.5"/>;
    return <Info size={15} className="text-ocean shrink-0 mt-0.5"/>;
  };

  const alertBg = (t: string) => {
    if (t==='danger' || t==='CRITICAL' || t==='HIGH') return 'bg-error-soft';
    if (t==='warning' || t==='MEDIUM') return 'bg-warning-soft';
    return 'bg-ocean-soft';
  };

  const alertType = (a: AlertItem): 'danger' | 'warning' | 'info' => {
    if (a.type === 'danger' || a.severity === 'HIGH' || a.severity === 'CRITICAL') return 'danger';
    if (a.type === 'warning' || a.severity === 'MEDIUM') return 'warning';
    return 'info';
  };

  return (
    <AdminLayout title="BI 看板">
      {/* Loading */}
      {allLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-terracotta" />
          <span className="ml-2 text-ink-mute">加载实时数据...</span>
        </div>
      )}

      {!allLoading && (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {KPIS.map((s, i) => (
              <div key={s.label} className={i===0 ? 'kpi-card-highlight' : 'kpi-card'}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-caption font-medium text-ink-mute uppercase tracking-wider">{s.label}</span>
                  <span className={i===0 ? 'text-terracotta' : 'text-ink-mute'}>{s.icon}</span>
                </div>
                <div className="price text-2xl text-ink mb-1">{s.value}</div>
                <span className={`inline-flex items-center gap-0.5 text-caption font-semibold ${s.up ? 'text-success' : 'text-error'}`}>
                  {s.up ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                  {s.change}
                </span>
              </div>
            ))}
          </div>

          {/* Revenue Trend + Profit Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 card-feature">
              <h2 className="text-heading-sm font-display text-ink mb-4">营收趋势（近7天）</h2>
              {trendData ? (
                <div className="space-y-2">
                  <div className="h-40 flex items-end gap-3">
                    {trendData.bars.map((b, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div
                          className="w-full bg-terracotta transition-all duration-500"
                          style={{ height: `${Math.max(b.pct * 100, 4)}%`, minHeight: '4px' }}
                        />
                        <span className="text-[10px] text-ink-mute">{b.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-micro text-ink-mute text-right">
                    Max: {formatRp(trendData.max)}
                  </div>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-ink-mute">暂无数据</div>
              )}
            </div>

            <div className="card-feature">
              <h2 className="text-heading-sm font-display text-ink mb-4">利润快照</h2>
              {profit.data ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-display-md font-bold text-success">{profit.data.margin}</div>
                    <div className="text-caption text-ink-mute mt-1">毛利率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-heading-xl font-bold text-ink">{profit.data.revenue}</div>
                    <div className="text-caption text-ink-mute mt-1">月营收</div>
                  </div>
                  <div className="pt-3 border-t border-hairline grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-body font-bold text-ink">{profit.data.todayGmv}</div>
                      <div className="text-[10px] text-ink-mute">今日 GMV</div>
                    </div>
                    <div>
                      <div className="text-body font-bold text-ink">{profit.data.totalProfit}</div>
                      <div className="text-[10px] text-ink-mute">Total Profit</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-ink-mute">加载利润数据...</div>
              )}
              {profit.error && <div className="text-micro text-warning mt-3 text-center">后端离线</div>}
            </div>
          </div>

          {/* Alerts + Pool Balances */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 card-feature">
              <h2 className="text-heading-sm font-display text-ink mb-4">Live Alerts</h2>
              <div className="space-y-2.5">
                {alerts.length > 0 ? alerts.map(a => {
                  const t = alertType(a);
                  return (
                    <div key={a.id} className={`flex items-start gap-2.5 p-3 ${alertBg(a.severity || a.type)}`}>
                      {alertIcon(a.severity || a.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm text-ink leading-relaxed">{a.message}</p>
                        <span className="text-micro text-ink-mute mt-1 block">{a.time}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-4 text-ink-mute text-caption">暂无告警 — 一切正常 ✅</div>
                )}
              </div>
            </div>

            <div className="card-feature">
              <h2 className="text-heading-sm font-display text-ink mb-4">资金池余额</h2>
              <div className="space-y-1.5">
                {poolItems.length > 0 ? poolItems.map(p => (
                  <div key={p.pool} className="flex items-center justify-between py-2.5 border-b border-hairline last:border-0">
                    <span className="text-body-sm text-ink-secondary">{p.pool}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-body-sm font-semibold tabular-nums text-ink">{p.balance}</span>
                      {p.status==='warning' && <span className="pill-tag-warning !text-[10px]">⚠</span>}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-ink-mute text-caption">Loading balances...</div>
                )}
              </div>
            </div>
          </div>

          {/* Regional Performance */}
          <div className="card-feature">
            <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
              <Globe size={18} className="text-ink-mute"/> Regional Performance
            </h2>
            {countryData && countryData.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {countryData.map(r => (
                  <div key={r.country} className="kpi-card !p-4 text-center">
                    <div className="text-caption text-ink-mute font-medium mb-1">{r.country}</div>
                    <div className="text-heading-md font-display font-bold text-ink mb-1">{r.orders}</div>
                    <div className="text-body-sm text-ink-secondary mb-2">{r.revenue}</div>
                    <span className="pill-tag-success !text-[10px]">{r.growth}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-ink-mute text-caption">暂无区域数据 — 订单将显示在这里</div>
            )}
          </div>

          {/* Status bar */}
          <div className="text-center py-6 mt-6">
            <p className="text-caption text-ink-mute flex items-center justify-center gap-2">
              {kpi.error ? (
                <><span className="w-1.5 h-1.5 bg-warning"/> Backend offline</>
              ) : (
                <><span className="w-1.5 h-1.5 bg-success"/> All systems operational · Live data from database</>
              )}
            </p>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
