import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Store, Plus, Edit3, Eye, Zap, Search, Filter, Loader2, Sparkles, Bot } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

interface ProductRow {
  id: string; name: string; category: string; costCNY: string; priceIDR: string;
  margin: string; stock: string; status: 'live'|'draft'|'soldout';
}

const statusConfig: Record<string,{cls:string;label:string}> = {
  live: { cls:'pill-tag-success', label:'在售' },
  ACTIVE: { cls:'pill-tag-success', label:'在售' },
  draft: { cls:'pill-tag-warning', label:'草稿' },
  DRAFT: { cls:'pill-tag-warning', label:'草稿' },
  soldout: { cls:'pill-tag-error', label:'已售罄' },
  OUT_OF_STOCK: { cls:'pill-tag-error', label:'已售罄' },
};

function mapProduct(p: any): ProductRow {
  const costCny = Number(p.costCny || p.sourcePriceCNY || 0);
  const priceIdr = Number(p.priceIdr || p.targetPriceIDR || 0);
  const margin = costCny > 0 ? Math.round((priceIdr / (costCny * 2200) - 1) * 100) : 0;
  let status: ProductRow['status'] = 'draft';
  if (p.status === 'ACTIVE') status = 'live';
  else if (p.status === 'OUT_OF_STOCK') status = 'soldout';
  else if (p.status === 'DRAFT') status = 'draft';

  return {
    id: p.id ? `#${p.id.toString().slice(-6)}` : 'N/A',
    name: p.name || 'Unknown',
    category: p.category || 'General',
    costCNY: `¥${costCny.toFixed(0)}`,
    priceIDR: `Rp ${priceIdr.toLocaleString()}`,
    margin: `${margin}%`,
    stock: p.stock != null ? (p.stock > 0 ? 'In Stock' : 'Sold Out') : '—',
    status,
  };
}

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const productsApi = useApi<any>('/product/list?limit=100');
  const loading = productsApi.loading;
  const error = productsApi.error;

  const products: ProductRow[] = productsApi.data?.items
    ? productsApi.data.items.map(mapProduct)
    : [];

  const filtered = products.filter(p => {
    if (filter!=='all' && p.status!==filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminLayout title="产品管理" actions={
      <div className="flex items-center gap-3">
        <span className="pill-tag-ocean !text-[10px] flex items-center gap-1">
          <Bot size={10}/> AI 智能助手在线
        </span>
        <button onClick={() => window.location.href='/admin/ai-sentinel?tab=arbibot'} className="btn-ocean !text-xs !px-4 !py-2 flex items-center gap-1.5 shadow-[3px_3px_0_#000]">
          <Zap size={14}/> 1688 智能寻货
        </button>
        <button className="btn-primary !text-xs !px-4 !py-2 flex items-center gap-1.5 shadow-[3px_3px_0_#000]">
          <Plus size={14}/> 新建产品
        </button>
      </div>
    }>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-terracotta" />
          <span className="ml-2 text-ink-mute">加载产品中...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"/>
              <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Search products..." className="search-bar !py-1.5 !text-sm pl-9"/>
            </div>
            <div className="flex gap-2">
              {(['all','live','draft','soldout'] as const).map(f => (
                <button key={f} onClick={()=>setFilter(f)}
                  className={`px-4 py-1.5 text-xs font-display font-semibold transition-colors ${
                    filter===f ? 'bg-terracotta text-white' : 'text-ink-secondary hover:bg-canvas-gray'
                  }`}>
                  {f==='all'?'全部': f==='live'?'在售' : f==='draft'?'草稿' : '已售罄'}
                </button>
              ))}
            </div>
          </div>

          {/* Product Table */}
          <div className="card-feature">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header border-b border-hairline">
                    <th className="text-left py-2.5 px-3">产品</th>
                    <th className="text-left py-2.5 px-3">品类</th>
                    <th className="text-right py-2.5 px-3">成本</th>
                    <th className="text-right py-2.5 px-3">售价</th>
                    <th className="text-right py-2.5 px-3">利润率</th>
                    <th className="text-center py-2.5 px-3">库存</th>
                    <th className="text-center py-2.5 px-3">状态</th>
                    <th className="text-center py-2.5 px-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const sc = statusConfig[p.status] || statusConfig.draft;
                    return (
                      <tr key={p.id || i} className="border-b border-hairline hover:bg-canvas-gray">
                        <td className="py-3 px-3">
                          <div className="font-medium text-body-sm">{p.name}</div>
                          <div className="text-micro text-ink-mute">{p.id}</div>
                        </td>
                        <td className="py-3 px-3 text-body-sm text-ink-secondary">{p.category}</td>
                        <td className="py-3 px-3 text-right text-body-sm tabular-nums">{p.costCNY}</td>
                        <td className="py-3 px-3 text-right text-body-sm tabular-nums font-semibold">{p.priceIDR}</td>
                        <td className="py-3 px-3 text-right text-body-sm tabular-nums font-bold text-success">{p.margin}</td>
                        <td className="py-3 px-3 text-center text-body-sm text-ink-secondary">{p.stock}</td>
                        <td className="py-3 px-3 text-center"><span className={sc.cls}>{sc.label}</span></td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => {
                                alert('正在调用 image-prompt-guide 进行 AIGC 视觉精修...\n正在生成 Jakarta_Elite_Premium 风格素材...');
                              }}
                              className="btn-ghost !text-xs !px-2 !py-1 text-ocean" 
                              title="AI 视觉精修"
                            >
                              <Sparkles size={13}/>
                            </button>
                            <button className="btn-ghost !text-xs !px-2 !py-1" title="编辑详情"><Edit3 size={13}/></button>
                            <button className="btn-ghost !text-xs !px-2 !py-1" title="预览"><Eye size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-ink-mute text-body-sm">暂无产品</div>
            )}
            {filtered.length > 0 && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-hairline">
                <span className="text-caption text-ink-mute">Showing {filtered.length} of {products.length} products</span>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
