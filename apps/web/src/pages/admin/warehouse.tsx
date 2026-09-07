import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Truck, Package, Camera, Check, X, Eye, Zap, Loader2,
  ArrowDownToLine, ArrowUpFromLine, Warehouse, MapPin, Search,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';

interface QCItem {
  id: string; orderId: string; product: string; status: 'passed'|'failed'|'pending';
  matchScore: string; time: string;
}

const INBOUND_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING: { label: '待收货', cls: 'bg-ink/5 text-ink-mute' },
  RECEIVING: { label: '收货中', cls: 'bg-accent/10 text-accent' },
  QC_CHECK: { label: '质检中', cls: 'bg-warning/10 text-warning' },
  PUT_AWAY: { label: '上架中', cls: 'bg-ocean/10 text-ocean' },
  COMPLETED: { label: '已完成', cls: 'bg-success/10 text-success' },
};

const OUTBOUND_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING: { label: '待拣货', cls: 'bg-ink/5 text-ink-mute' },
  PICKING: { label: '拣货中', cls: 'bg-accent/10 text-accent' },
  PACKED: { label: '已打包', cls: 'bg-ocean/10 text-ocean' },
  SHIPPED: { label: '已发货', cls: 'bg-warning/10 text-warning' },
  DELIVERED: { label: '已签收', cls: 'bg-success/10 text-success' },
};

const qcConfig: Record<string,{cls:string;icon:JSX.Element;label:string}> = {
  passed: { cls:'pill-tag-success', icon:<Check size={12}/>, label:'通过' },
  failed: { cls:'pill-tag-error', icon:<X size={12}/>, label:'未通过' },
  pending: { cls:'pill-tag-warning', icon:<span style={{fontSize:12}}>⏳</span>, label:'待检' },
};

function mapQCResult(r: any): QCItem {
  const statusMap: Record<string, QCItem['status']> = { SUCCESS: 'passed', REJECT: 'failed', MANUAL_REVIEW: 'pending' };
  return {
    id: r.qcStamp || r.id || 'N/A',
    orderId: r.orderId || '—',
    product: r.productName || r.expectedProduct?.name || '—',
    status: statusMap[r.status] || 'pending',
    matchScore: r.confidenceScore ? `${r.confidenceScore}%` : '—',
    time: r.metadata?.timestamp ? new Date(r.metadata.timestamp).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) : '—',
  };
}

export default function WarehousePage() {
  const [tab, setTab] = useState<'qc'|'inbound'|'outbound'|'consolidation'|'packaging'>('qc');
  const [inbounds, setInbounds] = useState<any[]>([]);
  const [outbounds, setOutbounds] = useState<any[]>([]);
  const [inboundFilter, setInboundFilter] = useState('');
  const [outboundFilter, setOutboundFilter] = useState('');
  const [warehouses, setWarehouses] = useState<any[]>([]);

  const [qcReports, setQcReports] = useState<any[]>([]);
  const [consolidations, setConsolidations] = useState<any[]>([]);

  const thresholdsApi = useApi<any>('/wms/qc-thresholds');
  const loading = thresholdsApi.loading;
  const thresholds = thresholdsApi.data || [];

  const fetchQCReports = useCallback(async () => {
    try {
      const res = await fetch('/wms/qc');
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json) ? json : json?.data || [];
        setQcReports(Array.isArray(items) ? items.map(mapQCResult) : []);
      }
    } catch { /* keep empty */ }
  }, []);

  const fetchConsolidations = useCallback(async () => {
    try {
      const res = await fetch('/api/wms/consolidations');
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json) ? json : json?.data || [];
        setConsolidations(Array.isArray(items) ? items : []);
      }
    } catch { /* keep empty */ }
  }, []);

  const fetchInbounds = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (inboundFilter) params.set('status', inboundFilter);
      const res = await fetch(`/api/wms/inbounds?${params}`);
      const json = await res.json();
      setInbounds(json.data || []);
    } catch { }
  }, [inboundFilter]);

  const fetchOutbounds = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (outboundFilter) params.set('status', outboundFilter);
      const res = await fetch(`/api/wms/outbounds?${params}`);
      const json = await res.json();
      setOutbounds(json.data || []);
    } catch { }
  }, [outboundFilter]);

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await fetch('/api/wms/warehouses');
      if (!res.ok) return;
      const json = await res.json();
      const items = Array.isArray(json) ? json : json?.data;
      setWarehouses(Array.isArray(items) ? items : []);
    } catch { }
  }, []);

  useEffect(() => { fetchInbounds(); }, [fetchInbounds]);
  useEffect(() => { fetchOutbounds(); }, [fetchOutbounds]);
  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);
  useEffect(() => { fetchQCReports(); }, [fetchQCReports]);
  useEffect(() => { fetchConsolidations(); }, [fetchConsolidations]);

  const updateInboundStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/wms/inbounds/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchInbounds();
    } catch { }
  };

  const updateOutboundStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/wms/outbounds/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchOutbounds();
    } catch { }
  };

  const tabs = [
    { id:'qc', label:'VisionQC', icon:<Camera size={15}/> },
    { id:'inbound', label:'入库管理', icon:<ArrowDownToLine size={15}/> },
    { id:'outbound', label:'出库管理', icon:<ArrowUpFromLine size={15}/> },
    { id:'consolidation', label:'集运', icon:<Truck size={15}/> },
    { id:'packaging', label:'打包SOP', icon:<Package size={15}/> },
  ] as const;

  return (
    <AdminLayout title="仓库管理">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-display font-semibold transition-colors whitespace-nowrap ${
              tab===t.id ? 'bg-ocean text-white' : 'text-ink-secondary hover:bg-canvas-gray'
            }`}>{t.icon}{t.label}</button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-terracotta" />
          <span className="ml-2 text-ink-mute">加载中...</span>
        </div>
      )}

      {/* VisionQC */}
      {!loading && tab==='qc' && (
        <div className="card-feature">
          <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
            <Eye size={16} className="text-ocean"/> AI 视觉质检
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header border-b border-hairline">
                  <th className="text-left py-2.5 px-3">QC ID</th><th className="text-left py-2.5 px-3">Order</th>
                  <th className="text-left py-2.5 px-3">Product</th><th className="text-center py-2.5 px-3">Match Score</th>
                  <th className="text-center py-2.5 px-3">Status</th><th className="text-right py-2.5 px-3">Time</th>
                  <th className="text-center py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {qcReports.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-ink-mute">暂无质检报告 — 需订单到达仓库后触发 AI 质检</td></tr>
                ) : qcReports.map((q, i) => {
                  const sc = qcConfig[q.status] || qcConfig.pending;
                  return (
                    <tr key={q.id || i} className="border-b border-hairline hover:bg-canvas-gray">
                      <td className="py-3 px-3 text-body-sm font-mono font-medium text-ocean">{q.id}</td>
                      <td className="py-3 px-3 text-body-sm">{q.orderId}</td>
                      <td className="py-3 px-3 text-body-sm">{q.product}</td>
                      <td className="py-3 px-3 text-center text-body-sm tabular-nums font-semibold">{q.matchScore}</td>
                      <td className="py-3 px-3 text-center"><span className={`${sc.cls} inline-flex items-center gap-1`}>{sc.icon}{q.status.toUpperCase()}</span></td>
                      <td className="py-3 px-3 text-right text-caption text-ink-mute">{q.time}</td>
                      <td className="py-3 px-3 text-center">
                        {q.status==='pending' ? (
                          <div className="flex gap-1 justify-center">
                            <button className="btn-primary !text-[10px] !px-2 !py-1">通过</button>
                            <button className="btn-danger !text-[10px] !px-2 !py-1">拒绝</button>
                          </div>
                        ) : <button className="btn-ghost !text-xs">查看</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {thresholds.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {thresholds.map((c: any, i: number) => (
                <div key={i} className="bg-canvas-gray p-4">
                  <div className="font-semibold text-body-sm text-ink mb-1">{c.category}</div>
                  <div className="text-micro text-ink-mute">
                    Color ΔE &lt; {c.colorDelta || 'N/A'} · Specs {Math.round((c.specsMatch || 0.95) * 100)}% · Defect: {c.checkDefects ? 'Yes' : 'No'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 入库管理 */}
      {!loading && tab==='inbound' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <select value={inboundFilter} onChange={(e) => setInboundFilter(e.target.value)} className="input-field !w-48 text-sm">
              <option value="">全部状态</option>
              <option value="PENDING">待收货</option>
              <option value="RECEIVING">收货中</option>
              <option value="QC_CHECK">质检中</option>
              <option value="PUT_AWAY">上架中</option>
              <option value="COMPLETED">已完成</option>
            </select>
            <div className="flex-1" />
            <span className="text-sm text-ink-mute">{inbounds.length} 条入库单</span>
          </div>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/8">
                    <th className="text-left py-3 px-4 text-ink-mute font-medium">入库单号</th>
                    <th className="text-left py-3 px-4 text-ink-mute font-medium">仓库</th>
                    <th className="text-left py-3 px-4 text-ink-mute font-medium">采购单</th>
                    <th className="text-center py-3 px-4 text-ink-mute font-medium">物品数</th>
                    <th className="text-center py-3 px-4 text-ink-mute font-medium">状态</th>
                    <th className="text-right py-3 px-4 text-ink-mute font-medium">创建时间</th>
                    <th className="text-right py-3 px-4 text-ink-mute font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {inbounds.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-ink-mute">暂无入库单</td></tr>
                  ) : inbounds.map((ib: any) => {
                    const s = INBOUND_STATUS_MAP[ib.status] || INBOUND_STATUS_MAP.PENDING;
                    const nextStatus = ib.status === 'PENDING' ? 'RECEIVING' : ib.status === 'RECEIVING' ? 'QC_CHECK' : ib.status === 'QC_CHECK' ? 'PUT_AWAY' : null;
                    return (
                      <tr key={ib.id} className="border-b border-ink/5 hover:bg-ink/[0.02]">
                        <td className="py-3 px-4 font-mono text-xs">{ib.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4">{ib.warehouse?.name || '-'}</td>
                        <td className="py-3 px-4 font-mono text-xs text-ink-mute">{ib.purchaseOrderId ? ib.purchaseOrderId.slice(0, 8) + '...' : '-'}</td>
                        <td className="py-3 px-4 text-center">{ib.receivedItems}/{ib.totalItems}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium ${s.cls}`}>{s.label}</span>
                        </td>
                        <td className="py-3 px-4 text-right text-ink-mute text-xs">{new Date(ib.createdAt).toLocaleDateString('zh-CN')}</td>
                        <td className="py-3 px-4 text-right">
                          {nextStatus && (
                            <button onClick={() => updateInboundStatus(ib.id, nextStatus)} className="text-[11px] px-2 py-1 rounded bg-accent/10 text-accent hover:bg-accent/20">
                              → {INBOUND_STATUS_MAP[nextStatus]?.label}
                            </button>
                          )}
                          {ib.status === 'PUT_AWAY' && (
                            <button onClick={() => updateInboundStatus(ib.id, 'COMPLETED')} className="text-[11px] px-2 py-1 rounded bg-success/10 text-success hover:bg-success/20 ml-1">完成上架</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 出库管理 */}
      {!loading && tab==='outbound' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <select value={outboundFilter} onChange={(e) => setOutboundFilter(e.target.value)} className="input-field !w-48 text-sm">
              <option value="">全部状态</option>
              <option value="PENDING">待拣货</option>
              <option value="PICKING">拣货中</option>
              <option value="PACKED">已打包</option>
              <option value="SHIPPED">已发货</option>
              <option value="DELIVERED">已签收</option>
            </select>
            <div className="flex-1" />
            <span className="text-sm text-ink-mute">{outbounds.length} 条出库单</span>
          </div>
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/8">
                    <th className="text-left py-3 px-4 text-ink-mute font-medium">出库单号</th>
                    <th className="text-left py-3 px-4 text-ink-mute font-medium">仓库</th>
                    <th className="text-left py-3 px-4 text-ink-mute font-medium">关联订单</th>
                    <th className="text-left py-3 px-4 text-ink-mute font-medium">目的地</th>
                    <th className="text-center py-3 px-4 text-ink-mute font-medium">物品数</th>
                    <th className="text-center py-3 px-4 text-ink-mute font-medium">状态</th>
                    <th className="text-right py-3 px-4 text-ink-mute font-medium">时间</th>
                    <th className="text-right py-3 px-4 text-ink-mute font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {outbounds.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 text-ink-mute">暂无出库单</td></tr>
                  ) : outbounds.map((ob: any) => {
                    const s = OUTBOUND_STATUS_MAP[ob.status] || OUTBOUND_STATUS_MAP.PENDING;
                    const nextStatus = ob.status === 'PENDING' ? 'PICKING' : ob.status === 'PICKING' ? 'PACKED' : ob.status === 'PACKED' ? 'SHIPPED' : ob.status === 'SHIPPED' ? 'DELIVERED' : null;
                    return (
                      <tr key={ob.id} className="border-b border-ink/5 hover:bg-ink/[0.02]">
                        <td className="py-3 px-4 font-mono text-xs">{ob.id.slice(0, 8)}...</td>
                        <td className="py-3 px-4">{ob.warehouse?.name || '-'}</td>
                        <td className="py-3 px-4 font-mono text-xs text-ink-mute">{ob.orderId ? ob.orderId.slice(0, 8) + '...' : '-'}</td>
                        <td className="py-3 px-4">{ob.destination || '-'}</td>
                        <td className="py-3 px-4 text-center">{ob.pickedItems}/{ob.totalItems}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium ${s.cls}`}>{s.label}</span>
                        </td>
                        <td className="py-3 px-4 text-right text-ink-mute text-xs">{new Date(ob.createdAt).toLocaleDateString('zh-CN')}</td>
                        <td className="py-3 px-4 text-right">
                          {nextStatus && (
                            <button onClick={() => updateOutboundStatus(ob.id, nextStatus)} className="text-[11px] px-2 py-1 rounded bg-accent/10 text-accent hover:bg-accent/20">
                              → {OUTBOUND_STATUS_MAP[nextStatus]?.label}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Consolidation */}
      {!loading && tab==='consolidation' && (
        <div className="space-y-6">
          {consolidations.length === 0 ? (
            <div className="card-feature text-center py-12 text-ink-mute">
              暂无集运包裹 — 需至少 2 个包裹到达仓库后方可创建集运单
            </div>
          ) : consolidations.map(c => (
            <div key={c.id || c.batchId} className="card-feature">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-ink flex items-center gap-2">
                  <Truck size={16} className="text-ocean"/> 主包裹 {c.id || c.batchId || c.boxNumber}
                </h3>
                <span className={`pill-tag ${c.status === 'SHIPPED' ? 'pill-tag-success' : 'pill-tag-ocean'}`}>
                  {c.status || '集运中'}
                </span>
              </div>
              <div className="flex justify-between text-body-sm text-ink-secondary mb-2">
                <span>{c.arrived || 0}/{c.items || c.totalItems || 0} 件已到达</span>
                <span>体积: {(c.totalWeight || c.weight || '—')} </span>
                <span>箱号: {c.boxNumber || '—'}</span>
              </div>
              <div className="h-2 bg-canvas-gray overflow-hidden">
                <div className="h-full bg-ocean" style={{width:`${Math.min(((c.arrived || 0) / (c.items || c.totalItems || 1)) * 100, 100)}%`}}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Packaging SOP */}
      {!loading && tab==='packaging' && (
        <div className="card-feature">
          <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
            <Package size={16} className="text-terracotta"/> 真空压缩 SOP
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { step:1, title:'扫码识别', desc:'扫描1688 SKU → AI判定压缩类型（压缩/标准）' },
              { step:2, title:'折叠装袋', desc:'服装展平折叠，隐藏拉链 → 放入 AceProxy 真空内袋' },
              { step:3, title:'真空热封', desc:'工业真空封口机 → 双线8mm热封 → 冷却2-3秒' },
              { step:4, title:'外袋与标签', desc:'装入哑光银色快递外袋 → 防拆封口 → 打印标签' },
              { step:5, title:'三图留证', desc:'原始质检图 + 称重图 + 最终包装图 → 推送用户' },
            ].map(s => (
              <div key={s.step} className="flex gap-4 p-4 bg-canvas-gray ">
                <div className="w-8 h-8 bg-terracotta text-white flex items-center justify-center font-bold text-sm font-display shrink-0">{s.step}</div>
                <div>
                  <div className="font-semibold text-body-sm text-ink">{s.title}</div>
                  <div className="text-body-sm text-ink-muted mt-1">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-success-soft border border-success/20">
            <div className="flex items-start gap-3">
              <Zap size={16} className="text-success shrink-0 mt-0.5"/>
              <div className="text-body-sm text-ink">
                <strong>压缩收益:</strong> 真空密封可将服装的体积重量降低 40-60%。
                这将直接提升 L3 物流利润 1.5倍以上。
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
