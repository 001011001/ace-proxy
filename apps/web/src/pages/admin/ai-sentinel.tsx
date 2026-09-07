import { useApi } from '../../hooks/useApi';
import AdminLayout from '../../components/admin/AdminLayout';
import { Sparkles, TrendingUp, Scan, Bot, Shield, Search, Zap, ArrowRight, Eye, Globe, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface TrendingProduct { id: string; name: string; platform: string; originalPrice: string; ourPrice: string; margin: string; status: string; }
interface PatentRisk { id: string; product: string; risk: 'high'|'medium'|'low'; detail: string; }

const riskConfig = { high: { cls:'pill-tag-error', label:'高' }, medium: { cls:'pill-tag-warning', label:'中' }, low: { cls:'pill-tag-success', label:'低' } };

const TABS = [
  { id:'trending', label:'Trending Products', icon:<TrendingUp size={16}/> },
  { id:'arbibot', label:'ArbiBot Scanner', icon:<Bot size={16}/> },
  { id:'patent', label:'Patent Sentinel', icon:<Shield size={16}/> },
  { id:'aigc', label:'AIGC Content', icon:<Sparkles size={16}/> },
] as const;

export default function AISentinelPage() {
  const trending = useApi('/trending/scan');
  const recommendations = useApi('/trending/recommendations');
  const patentApi = useApi('/compliance/audit-log');
  const [tab, setTab] = useState<string>('trending');
  const [scanUrl, setScanUrl] = useState('');
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScan = async () => {
    if (!scanUrl) return;
    setScanResult('Analyzing...');
    try {
      const res = await fetch('/api/v1/arbibot/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scanUrl }),
      });
      const json = await res.json();
      const data = json.data || json;
      if (data.arbitrageGapPct != null) {
        setScanResult(
          `Found 1688 match: ¥${data.sourcePriceCNY}/unit · Est. margin: ${(data.arbitrageGapPct * 100).toFixed(0)}% · All-in price: Rp ${data.allInPriceIDR?.toLocaleString() || '—'}`,
        );
      } else {
        setScanResult(json.message || 'Analysis complete. Check console for details.');
      }
    } catch {
      setScanResult('分析服务暂时不可用，请稍后重试。确保后端 ArbiBot 服务正在运行。');
    }
  };

  const connected = !trending.error;
  const trendingData = trending.data?.products || trending.data?.items || [];
  const displayTrending: TrendingProduct[] = trendingData.map((p: any) => ({
    id: p.id || p.productId || 'TR-XXX',
    name: p.name || p.title || 'Product',
    platform: p.platform || p.source || 'Trending',
    originalPrice: p.marketPrice || p.originalPrice || '—',
    ourPrice: p.ourCost || p.sourcePriceCNY ? `¥${p.sourcePriceCNY}` : '—',
    margin: p.margin || (p.marginPct ? `${p.marginPct}%` : '—'),
    status: p.status || 'new',
  }));

  return (
    <AdminLayout title="AI 哨兵" actions={
      <span className={`pill-tag ${connected ? 'pill-tag-success' : 'pill-tag-warning'} !text-[10px]`}>
        {connected ? 'AI 在线' : 'AI 待机'}
      </span>
    }>
      {/* Tab Pills */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-display font-semibold transition-colors whitespace-nowrap ${
              tab===t.id ? 'bg-ocean text-white' : 'text-ink-secondary hover:bg-canvas-gray'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Trending Products */}
      {tab==='trending' && (
        <div className="card-feature">
          <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
            <Zap size={16} className="text-warning"/> 爆品扫描器
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header border-b border-hairline">
                  <th className="text-left py-2.5 px-3">产品</th>
                  <th className="text-left py-2.5 px-3">来源</th>
                  <th className="text-right py-2.5 px-3">市场价</th>
                  <th className="text-right py-2.5 px-3">成本价</th>
                  <th className="text-right py-2.5 px-3">利润率</th>
                  <th className="text-center py-2.5 px-3">状态</th>
                  <th className="text-center py-2.5 px-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {displayTrending.map(p => (
                  <tr key={p.id} className="border-b border-hairline hover:bg-canvas-gray transition-colors">
                    <td className="py-3 px-3 font-medium text-body-sm">{p.name}</td>
                    <td className="py-3 px-3 text-body-sm text-ink-mute">{p.platform}</td>
                    <td className="py-3 px-3 text-right text-body-sm tabular-nums line-through text-ink-mute">{p.originalPrice}</td>
                    <td className="py-3 px-3 text-right text-body-sm tabular-nums font-semibold text-success">{p.ourPrice}</td>
                    <td className="py-3 px-3 text-right text-body-sm tabular-nums font-bold text-success">{p.margin}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`pill-tag ${p.status==='hot' ? 'pill-tag-error' : p.status==='trending' ? 'pill-tag-warning' : 'pill-tag-ocean'}`}>{p.status.toUpperCase()}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button className="btn-primary !text-xs !px-3 !py-1">立即上架 →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn-outline !text-xs mt-4 flex items-center gap-1">
            <RefreshCw size={12}/> Scan All Platforms
          </button>
        </div>
      )}

      {/* ArbiBot Scanner */}
      {tab==='arbibot' && (
        <div className="card-feature">
          <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
            <Bot size={18} className="text-ocean"/> ArbiBot — AI 套利扫描器
          </h2>
          <p className="text-body-sm text-ink-mute mb-6">
            粘贴 Shopee/Tokopedia/Amazon 链接，查找 1688 货源并计算套利利润。
          </p>
          <div className="flex gap-3 mb-6">
            <input
              type="text" value={scanUrl} onChange={e => setScanUrl(e.target.value)}
              placeholder="粘贴 Shopee/Amazon 商品链接..."
              className="text-input flex-1"
            />
            <button onClick={handleScan} className="btn-ocean flex items-center gap-2">
              <Search size={16}/> Scan
            </button>
          </div>
          {scanResult && (
            <div className="bg-ocean-soft p-4 border border-ocean/20">
              <div className="flex items-start gap-3">
                <Eye size={18} className="text-ocean shrink-0 mt-0.5"/>
                <div>
                  <div className="font-semibold text-ocean mb-1">ArbiBot 扫描结果</div>
                  <div className="text-body-sm text-ink">{scanResult}</div>
                </div>
              </div>
            </div>
          )}
          <div className="mt-6 p-4 bg-warning-soft border border-warning/20">
            <div className="flex items-start gap-3">
              <Sparkles size={16} className="text-warning shrink-0 mt-0.5"/>
              <div className="text-body-sm text-ink">
                <strong>专家建议:</strong> ArbiBot 自动监控 TikTok 广告、Facebook 广告库和 Shopify 店铺，实时发现爆品。
                当利润率超过 200%，产品将自动排队等待你的审核。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patent Sentinel */}
      {tab==='patent' && (
        <div>
          <div className="card-feature mb-6">
            <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
              <Shield size={18} className="text-error"/> 专利商标风险审计
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header border-b border-hairline">
                  <th className="text-left py-2.5 px-3">产品</th>
                  <th className="text-center py-2.5 px-3">风险等级</th>
                  <th className="text-left py-2.5 px-3">详情</th>
                  <th className="text-center py-2.5 px-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {(patentApi.data?.items || patentApi.data || []).length > 0 ? (
                    (patentApi.data?.items || patentApi.data || []).map((pr: any, i: number) => {
                      const risk: PatentRisk['risk'] = pr.risk || pr.severity === 'CRITICAL' ? 'high' : pr.severity === 'WARNING' ? 'medium' : 'low';
                      const rc = riskConfig[risk];
                      return (
                        <tr key={pr.id || i} className="border-b border-hairline hover:bg-canvas-gray">
                          <td className="py-3 px-3 font-medium text-body-sm">{pr.product || pr.name || 'Unknown'}</td>
                          <td className="py-3 px-3 text-center"><span className={rc.cls}>{rc.label}</span></td>
                          <td className="py-3 px-3 text-body-sm text-ink-secondary">{pr.detail || pr.description || pr.message || '—'}</td>
                          <td className="py-3 px-3 text-center">
                            {risk === 'high' ? (
                              <button className="btn-danger !text-xs !px-3 !py-1">拦截</button>
                            ) : (
                              <button className="btn-ghost !text-xs">审查</button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-ink-mute text-body-sm">
                        未检测到专利风险 — 所有产品安全
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-feature">
            <h3 className="text-heading-sm font-display text-ink mb-2">安全规则</h3>
            <ul className="space-y-2 text-body-sm text-ink-secondary">
              <li className="flex items-start gap-2"><span className="pill-tag-error !text-[10px] shrink-0 mt-0.5">拦截</span> Apple、LEGO、Disney、Nike 商标 — 自动拒绝</li>
              <li className="flex items-start gap-2"><span className="pill-tag-warning !text-[10px] shrink-0 mt-0.5">警告</span> "大牌风格" 关键词 — 标记审查</li>
              <li className="flex items-start gap-2"><span className="pill-tag-success !text-[10px] shrink-0 mt-0.5">通过</span> 公共领域 / 原创设计 — 自动批准</li>
              <li className="flex items-start gap-2"><span className="pill-tag-ocean !text-[10px] shrink-0 mt-0.5">要求</span> 所有产品发布前必须获得 LEGAL_CLEARANCE_ID</li>
            </ul>
          </div>
        </div>
      )}

      {/* AIGC Content */}
      {tab==='aigc' && (
        <div className="card-feature">
          <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-terracotta"/> AIGC Content Generator
          </h2>
          <p className="text-body-sm text-ink-mute mb-6">
            AI 自动将 1688 中文描述翻译为本地化印尼语营销文案，针对 TikTok/WhatsApp 优化。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { title:'Premium Silk Hijab', status:'已生成', date:'今天', lang:'ID' },
              { title:'Travel Mukena Pro', status:'待处理', date:'—', lang:'ID' },
              { title:'Smart Zikr Ring', status:'待审核', date:'昨天', lang:'ID/TH' },
              { title:'LED Islamic Decor', status:'已生成', date:'今天', lang:'ID' },
              { title:'Modern Baju Koko', status:'待处理', date:'—', lang:'ID' },
              { title:'Minimalist Cookie Jar', status:'已生成', date:'昨天', lang:'ID' },
            ].map((c,i) => (
              <div key={i} className="kpi-card flex items-center justify-between">
                <div>
                  <div className="text-body-sm font-medium text-ink">{c.title}</div>
                  <div className="text-micro text-ink-mute">{c.lang} · {c.date}</div>
                </div>
                <span className={`pill-tag ${c.status==='Generated'?'pill-tag-success':c.status==='Pending'?'pill-tag-warning':'pill-tag-ocean'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
          <button className="btn-ocean flex items-center gap-2">
            <Sparkles size={14}/> 生成全部待处理
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
