import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { ClipboardList, Search, Filter, Eye, Truck, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

interface OrderRow {
  id: string; customer: string; product: string; amount: string;
  status: 'processing'|'shipped'|'delivered'|'issue'|'paid';
  country: string; time: string;
}

const statusConfig: Record<string,{cls:string;label:string}> = {
  paid: { cls:'pill-tag-ocean', label:'已付款' },
  processing: { cls:'pill-tag-warning', label:'处理中' },
  shipped: { cls:'pill-tag-primary', label:'已发货' },
  delivered: { cls:'pill-tag-success', label:'已送达' },
  issue: { cls:'pill-tag-error', label:'异常' },
  PENDING: { cls:'pill-tag-country', label:'待处理' },
  PAID: { cls:'pill-tag-ocean', label:'已付款' },
  MATCHING: { cls:'pill-tag-warning', label:'匹配中' },
  MATCHED: { cls:'pill-tag-ocean', label:'已匹配' },
  PURCHASING: { cls:'pill-tag-warning', label:'采购中' },
  PURCHASED: { cls:'pill-tag-ocean', label:'已采购' },
  SHIPPED: { cls:'pill-tag-primary', label:'已发货' },
  DELIVERED: { cls:'pill-tag-success', label:'已送达' },
  CANCELLED: { cls:'pill-tag-error', label:'已取消' },
};

// Map backend order to table row
function mapOrder(o: any): OrderRow {
  const s = (o.status || '').toLowerCase();
  return {
    id: o.id ? `#${o.id.toString().slice(-6)}` : 'N/A',
    customer: o.userId || o.customer || 'Guest',
    product: o.items?.[0]?.productId || o.product || '—',
    amount: o.totalAmount ? `Rp ${Number(o.totalAmount).toLocaleString()}` : (o.amount || '—'),
    status: s,
    country: o.country || 'ID',
    time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) : '—',
  };
}

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // 真实 API 驱动（无 mock 降级）：数据为空时展示空状态，失败时展示错误
  const ordersApi = useApi<any>('/order/list');
  const loading = ordersApi.loading;
  const apiData = ordersApi.data;
  const error = ordersApi.error;

  const orders: OrderRow[] = apiData?.items
    ? apiData.items.map(mapOrder)
    : [];

  const filtered = orders.filter(o => {
    if (statusFilter!=='all' && o.status!==statusFilter) return false;
    if (search && !o.customer.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Summary counts
  const summary = {
    all: orders.length,
    processing: orders.filter(o => ['processing','paid','PENDING','PAID','PURCHASING'].includes(o.status)).length,
    shipped: orders.filter(o => o.status==='shipped' || o.status==='SHIPPED').length,
    issues: orders.filter(o => o.status==='issue' || o.status==='CANCELLED').length,
  };

  return (
    <AdminLayout title="订单管理" actions={
      error && <span className="pill-tag-warning !text-[10px]">API 离线</span>
    }>
      {/* Loading Skeleton */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-terracotta" />
          <span className="ml-2 text-ink-mute">加载订单中...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label:'全部', value:summary.all, cls:'' },
              { label:'处理中', value:summary.processing, cls:'text-warning' },
              { label:'已发货', value:summary.shipped, cls:'text-ocean' },
              { label:'异常', value:summary.issues, cls:'text-error' },
            ].map(c => (
              <div key={c.label} onClick={()=>setStatusFilter(c.label.toLowerCase())}
                className="kpi-card text-center cursor-pointer hover:border-terracotta transition-colors">
                <div className={`text-display-md font-bold ${c.cls} mb-1`}>{c.value}</div>
                <div className="text-caption text-ink-mute">{c.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索订单..."
                className="search-bar !py-1.5 !text-sm pl-9"/>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all','paid','processing','shipped','delivered','issue'] as const).map(s => (
                <button key={s} onClick={()=>setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-display font-semibold transition-colors ${
                    statusFilter===s ? 'bg-terracotta text-white' : 'text-ink-secondary hover:bg-canvas-gray'
                  }`}>{s==='all'?'全部':s==='paid'?'已付款':s==='processing'?'处理中':s==='shipped'?'已发货':s==='delivered'?'已送达':'异常'}</button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="card-feature">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header border-b border-hairline">
                    <th className="text-left py-2.5 px-3">订单号</th>
                    <th className="text-left py-2.5 px-3">客户</th>
                    <th className="text-left py-2.5 px-3">产品</th>
                    <th className="text-right py-2.5 px-3">金额</th>
                    <th className="text-center py-2.5 px-3">状态</th>
                    <th className="text-right py-2.5 px-3">时间</th>
                    <th className="text-center py-2.5 px-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, i) => {
                    const sc = statusConfig[o.status] || statusConfig.processing;
                    return (
                      <tr key={o.id || i} className="border-b border-hairline hover:bg-canvas-gray">
                        <td className="py-3 px-3">
                          <span className="text-body-sm font-mono font-medium text-ocean">{o.id}</span>
                          <span className="ml-2 text-micro text-ink-mute">{o.country}</span>
                        </td>
                        <td className="py-3 px-3 text-body-sm">{o.customer}</td>
                        <td className="py-3 px-3 text-body-sm text-ink-secondary max-w-[160px] truncate">{o.product}</td>
                        <td className="py-3 px-3 text-right text-body-sm tabular-nums font-semibold">{o.amount}</td>
                        <td className="py-3 px-3 text-center"><span className={sc.cls}>{sc.label}</span></td>
                        <td className="py-3 px-3 text-right text-caption text-ink-mute">{o.time}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button className="btn-ghost !text-xs !px-2 !py-1" title="View"><Eye size={13}/></button>
                            <button className="btn-ghost !text-xs !px-2 !py-1" title="Track"><Truck size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-ink-mute text-body-sm">暂无订单</div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
