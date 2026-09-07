import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  ClipboardList, Plus, ArrowRight, CheckCircle2, Clock, Truck, XCircle,
  Search, ExternalLink, Package, ShoppingBag, ChevronDown, ChevronUp,
  Send, PenLine, X, RefreshCw,
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; icon: any; className: string }> = {
  DRAFT: { label: '待提交', icon: Clock, className: 'bg-ink/5 text-ink-mute' },
  SUBMITTED: { label: '待采购', icon: CheckCircle2, className: 'bg-accent/10 text-accent' },
  IN_TRANSIT: { label: '运输中', icon: Truck, className: 'bg-warning/10 text-warning' },
  RECEIVED: { label: '已入库', icon: CheckCircle2, className: 'bg-success/10 text-success' },
  CANCELLED: { label: '已取消', icon: XCircle, className: 'bg-danger/10 text-danger' },
};

const STATUS_FLOW: Record<string, string> = {
  DRAFT: 'SUBMITTED',
  SUBMITTED: 'IN_TRANSIT',
  IN_TRANSIT: 'RECEIVED',
};

// ─── Fulfillment Modal ───
function FulfillModal({ po, onClose, onSuccess }: { po: any; onClose: () => void; onSuccess: () => void }) {
  const [sourceUrl, setSourceUrl] = useState(po.sourceUrl || '');
  const [trackingNumber, setTrackingNumber] = useState(po.trackingNumber || '');
  const [notes, setNotes] = useState(po.notes || '');
  const [totalCostCny, setTotalCostCny] = useState(po.totalCostCny ? String(po.totalCostCny) : '');
  const [newStatus, setNewStatus] = useState<string>(STATUS_FLOW[po.status] || po.status);
  const [submitting, setSubmitting] = useState(false);

  const nextStatus = STATUS_FLOW[po.status];
  const statusLabel = STATUS_MAP[newStatus]?.label || newStatus;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}/fulfill`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl: sourceUrl || undefined,
          trackingNumber: trackingNumber || undefined,
          notes: notes || undefined,
          totalCostCny: totalCostCny ? Number(totalCostCny) : undefined,
          newStatus: newStatus !== po.status ? newStatus : undefined,
        }),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch { }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div className="bg-white border-4 border-black max-w-lg w-full max-h-[85vh] overflow-y-auto"
        style={{ boxShadow: '8px 8px 0 #000' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-4 border-black">
          <h3 className="font-display font-black text-lg text-ink uppercase flex items-center gap-2">
            <ShoppingBag size={18} className="text-terracotta" /> 履行采购单
          </h3>
          <button onClick={onClose} className="w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-canvas-gray">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* PO Info */}
          <div className="bg-canvas-warm border-2 border-black p-3">
            <div className="text-[10px] font-display font-bold text-ink-mute uppercase mb-1">采购单</div>
            <div className="font-mono text-sm font-bold">{po.id}</div>
            {po.orderId && (
              <div className="text-xs text-ink-secondary mt-1">关联订单: {po.orderId.slice(0, 12)}...</div>
            )}
          </div>

          {/* Items Summary */}
          {po.items?.length > 0 && (
            <div className="border-2 border-black p-3">
              <div className="text-[10px] font-display font-bold text-ink-mute uppercase mb-2">商品列表 ({po.items.length}项)</div>
              {po.items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-xs py-1 border-b border-black/5 last:border-0">
                  <span className="font-medium">{item.productName}</span>
                  <span className="font-mono text-ink-mute">{item.quantity}× ¥{Number(item.unitCostCny || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* 1688 Source URL */}
          <div>
            <label className="block text-xs font-display font-bold uppercase mb-1.5 text-ink">
              1688 商品链接 <span className="text-error">* 在1688下单后填写</span>
            </label>
            <input
              value={sourceUrl}
              onChange={e => setSourceUrl(e.target.value)}
              placeholder="https://detail.1688.com/offer/..."
              className="w-full px-3 py-2.5 border-3 border-black text-sm outline-none focus:border-terracotta" />
          </div>

          {/* Total Cost */}
          <div>
            <label className="block text-xs font-display font-bold uppercase mb-1.5 text-ink">实际采购成本 (¥)</label>
            <input
              type="number"
              value={totalCostCny}
              onChange={e => setTotalCostCny(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2.5 border-3 border-black text-sm font-mono outline-none focus:border-terracotta" />
          </div>

          {/* Tracking Number */}
          <div>
            <label className="block text-xs font-display font-bold uppercase mb-1.5 text-ink">
              1688 快递单号 (卖家发货后填写)
            </label>
            <input
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              placeholder="YT1234567890"
              className="w-full px-3 py-2.5 border-3 border-black text-sm font-mono outline-none focus:border-terracotta" />
          </div>

          {/* Status Advancement */}
          {nextStatus && (
            <div>
              <label className="block text-xs font-display font-bold uppercase mb-1.5 text-ink">推进状态</label>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 border-2 text-xs font-display font-bold ${STATUS_MAP[po.status]?.className}`}>
                  {STATUS_MAP[po.status]?.label}
                </span>
                <ArrowRight size={18} className="text-ink-mute" />
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 border-2 text-xs font-display font-bold ${STATUS_MAP[nextStatus]?.className}`}>
                  {STATUS_MAP[nextStatus]?.label}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-display font-bold uppercase mb-1.5 text-ink">备注</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="管理员备注..."
              rows={2}
              className="w-full px-3 py-2.5 border-3 border-black text-sm outline-none focus:border-terracotta resize-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t-4 border-black bg-canvas-warm">
          <button onClick={onClose} className="btn-brutal-outline flex-1 text-sm">取消</button>
          <button onClick={handleSubmit} disabled={submitting}
            className="btn-brutal flex-1 text-sm">
            {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
            确认提交
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fulfillPo, setFulfillPo] = useState<any>(null);

  useEffect(() => { fetchPOs(); }, [filter, page]);

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      params.set('page', String(page));
      params.set('pageSize', '20');
      const res = await fetch(`/api/purchase-orders?${params}`);
      const json = await res.json();
      setPos(json.data || []);
      setTotal(json.total || 0);
    } catch { } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/purchase-orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchPOs();
    } catch { }
  };

  return (
    <AdminLayout title="采购单管理">
      {/* 工具栏 */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
            className="input-field pl-9 pr-8 text-sm"
          >
            <option value="">全部状态</option>
            <option value="DRAFT">待提交</option>
            <option value="SUBMITTED">待采购</option>
            <option value="IN_TRANSIT">运输中</option>
            <option value="RECEIVED">已入库</option>
            <option value="CANCELLED">已取消</option>
          </select>
        </div>
        <div className="flex-1" />
        <button className="btn-outline text-xs">导出 CSV</button>
      </div>

      {/* 列表 */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/8 bg-canvas-warm">
                <th className="text-left py-3 px-4 text-ink-mute font-medium"></th>
                <th className="text-left py-3 px-4 text-ink-mute font-medium">采购单号</th>
                <th className="text-left py-3 px-4 text-ink-mute font-medium">关联订单</th>
                <th className="text-left py-3 px-4 text-ink-mute font-medium">1688来源</th>
                <th className="text-left py-3 px-4 text-ink-mute font-medium">产品数</th>
                <th className="text-right py-3 px-4 text-ink-mute font-medium">采购成本</th>
                <th className="text-center py-3 px-4 text-ink-mute font-medium">状态</th>
                <th className="text-left py-3 px-4 text-ink-mute font-medium">运单号</th>
                <th className="text-right py-3 px-4 text-ink-mute font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-ink-mute">加载中...</td></tr>
              ) : pos.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-ink-mute">暂无采购单</td></tr>
              ) : pos.map((po) => {
                const statusInfo = STATUS_MAP[po.status] || STATUS_MAP.DRAFT;
                const StatusIcon = statusInfo.icon;
                const isExpanded = expandedId === po.id;
                const nextStatus = STATUS_FLOW[po.status];

                return (
                  <tr key={po.id} className={`border-b border-ink/5 hover:bg-ink/[0.02] ${isExpanded ? 'bg-ocean/[0.03]' : ''}`}>
                    <td className="py-3 px-2">
                      <button onClick={() => setExpandedId(isExpanded ? null : po.id)}
                        className="w-7 h-7 border-2 border-black flex items-center justify-center hover:bg-canvas-gray">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-bold">{po.id.slice(0, 10)}...</td>
                    <td className="py-3 px-4 font-mono text-xs text-ink-mute">
                      {po.orderId ? po.id.slice(0, 10) + '...' : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {po.sourceUrl ? (
                        <a href={po.sourceUrl} target="_blank" rel="noopener"
                          className="inline-flex items-center gap-1 text-xs text-ocean font-bold hover:text-terracotta">
                          <ExternalLink size={12} /> 1688
                        </a>
                      ) : <span className="text-xs text-ink-mute/50">—</span>}
                    </td>
                    <td className="py-3 px-4 font-bold">{po.items?.length || 0} 个</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      ¥{Number(po.totalCostCny || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-display font-bold uppercase ${statusInfo.className}`}>
                        <StatusIcon size={12} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {po.trackingNumber ? (
                        <span className="font-mono text-xs font-bold text-ink">{po.trackingNumber}</span>
                      ) : <span className="text-xs text-ink-mute/40">—</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 履行按钮 - 核心代付操作 */}
                        <button
                          onClick={() => setFulfillPo(po)}
                          className="flex items-center gap-1 px-2.5 py-1.5 border-2 border-black bg-terracotta text-white text-[11px] font-display font-bold uppercase hover:bg-terracotta/90 transition-colors"
                          style={{ boxShadow: '2px 2px 0 #000' }}
                          title="填写1688下单信息并推进状态">
                          <PenLine size={12} /> 履行
                        </button>
                        {/* 快速状态推进 */}
                        {nextStatus && (
                          <button
                            onClick={() => updateStatus(po.id, nextStatus)}
                            className="flex items-center gap-1 px-2 py-1.5 border-2 border-black bg-white text-[11px] font-display font-bold uppercase hover:bg-canvas-gray"
                            title={`推进到 ${STATUS_MAP[nextStatus]?.label}`}>
                            <ArrowRight size={12} />
                            {STATUS_MAP[nextStatus]?.label}
                          </button>
                        )}
                        {po.status !== 'CANCELLED' && po.status !== 'RECEIVED' && (
                          <button
                            onClick={() => updateStatus(po.id, 'CANCELLED')}
                            className="text-[11px] px-2 py-1.5 border-2 border-black bg-white text-error hover:bg-error/10 font-bold">
                            取消
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-ink/8">
            <span className="text-xs text-ink-mute">共 {total} 条</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline text-xs !px-3 !py-1">
                上一页
              </button>
              <span className="text-xs px-3 py-1">{page} / {Math.ceil(total / 20)}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="btn-outline text-xs !px-3 !py-1">
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 快速统计 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[
          { label: '待采购', count: pos.filter(p => p.status === 'SUBMITTED').length, color: 'bg-accent/10 text-accent' },
          { label: '运输中', count: pos.filter(p => p.status === 'IN_TRANSIT').length, color: 'bg-warning/10 text-warning' },
          { label: '已入库', count: pos.filter(p => p.status === 'RECEIVED').length, color: 'bg-success/10 text-success' },
          { label: '总计', count: total, color: 'bg-ocean/10 text-ocean' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border-3 border-black p-3 text-center" style={{ boxShadow: '3px 3px 0 #000' }}>
            <div className={`text-2xl font-display font-black mb-1 ${stat.color.split(' ')[1]}`}>{stat.count}</div>
            <div className="text-[10px] font-display font-bold text-ink-mute uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Fulfillment Modal */}
      {fulfillPo && (
        <FulfillModal
          po={fulfillPo}
          onClose={() => setFulfillPo(null)}
          onSuccess={fetchPOs}
        />
      )}
    </AdminLayout>
  );
}
