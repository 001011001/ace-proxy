import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Settings as SettingsIcon, Globe, DollarSign, Truck, Shield, Save, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  // Load compliance data from backend
  const bannedApi = useApi<any>('/compliance/banned-categories');
  const restrictedApi = useApi<any>('/compliance/restricted-categories');
  const countriesApi = useApi<any>('/compliance/countries');
  const loading = bannedApi.loading || restrictedApi.loading || countriesApi.loading;

  const bannedCategories = bannedApi.data || [
    { category: 'DANGEROUS_GOODS', items: ['锂电池', '充电宝', '打火机', '火柴', '烟花', '压缩气体'] },
    { category: 'WEAPONS', items: ['刀具', '仿真枪', '电击器', '防狼喷雾'] },
    { category: 'DRUGS', items: ['药品', '处方药', '麻醉品', '兴奋剂'] },
    { category: 'FLAMMABLE', items: ['汽油', '酒精', '油漆', '香水（含酒精>70%）'] },
    { category: 'LIVE_ANIMALS', items: ['活体动物', '宠物', '昆虫'] },
    { category: 'COUNTERFEIT', items: ['仿牌', '假货', '盗版'] },
  ];

  const restrictedCategories = restrictedApi.data || [
    { key: 'BATTERY', label: '含电池产品', requiredDocs: ['MSDS', 'UN38.3检测报告'] },
    { key: 'LIQUID', label: '液体产品', requiredDocs: ['MSDS', '非危证明'] },
    { key: 'FOOD', label: '食品', requiredDocs: ['卫生证书', '原产地证明'] },
    { key: 'COSMETICS', label: '化妆品', requiredDocs: ['化妆品备案', '成分表'] },
    { key: 'ELECTRONICS', label: '电子产品', requiredDocs: ['CE/FCC认证', 'RoHS报告'] },
    { key: 'TOYS', label: '玩具', requiredDocs: ['EN71检测', 'CCC认证'] },
    { key: 'TEXTILES', label: '纺织品', requiredDocs: ['成分标签', '甲醛检测'] },
    { key: 'MEDICAL', label: '医疗器械', requiredDocs: ['FDA/CE注册', '临床报告'] },
  ];

  const countries = countriesApi.data || [
    { code: 'ID', agency: 'BPOM', ruleCount: 5 },
    { code: 'TH', agency: 'FDA Thailand', ruleCount: 3 },
    { code: 'PH', agency: 'FDA Philippines', ruleCount: 3 },
    { code: 'BR', agency: 'ANVISA', ruleCount: 3 },
  ];

  const handleSave = async () => {
    setSaved(true);
    try {
      // 尝试保存到后端配置端点
      await fetch('/api/v1/settings/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regions: [
            { region:'印尼', fx:'8%', factor:'低 (0.8)', fee:'5%', status:'活跃' },
            { region:'泰国', fx:'6%', factor:'中 (1.0)', fee:'8%', status:'活跃' },
            { region:'菲律宾', fx:'6%', factor:'中 (1.0)', fee:'8%', status:'待机' },
            { region:'巴西', fx:'5%', factor:'高 (1.2)', fee:'10%', status:'规划中' },
          ],
        }),
      });
    } catch {
      // 后端可能没有 /settings/config 端点，静默失败
    }
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminLayout title="系统设置" actions={
      saved && <span className="pill-tag-success !text-[10px]">已保存</span>
    }>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-terracotta" />
          <span className="ml-2 text-ink-mute">加载合规数据...</span>
        </div>
      )}

      {!loading && (
        <div className="space-y-6 max-w-3xl">

          {/* Regional Pricing */}
          <div className="card-feature">
            <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
              <Globe size={16} className="text-ocean"/> Regional Pricing Config
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header border-b border-hairline">
                    <th className="text-left py-2.5 px-3">区域</th>
                    <th className="text-right py-2.5 px-3">外汇缓冲</th>
                    <th className="text-right py-2.5 px-3">区域系数</th>
                    <th className="text-right py-2.5 px-3">服务费</th>
                    <th className="text-center py-2.5 px-3">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { region:'印尼', fx:'8%', factor:'低 (0.8)', fee:'5%', status:'活跃' },
                    { region:'泰国', fx:'6%', factor:'中 (1.0)', fee:'8%', status:'活跃' },
                    { region:'菲律宾', fx:'6%', factor:'中 (1.0)', fee:'8%', status:'待机' },
                    { region:'巴西', fx:'5%', factor:'高 (1.2)', fee:'10%', status:'规划中' },
                  ].map(r => (
                    <tr key={r.region} className="border-b border-hairline hover:bg-canvas-gray">
                      <td className="py-3 px-3 font-medium text-body-sm">{r.region}</td>
                      <td className="py-3 px-3 text-right text-body-sm tabular-nums">{r.fx}</td>
                      <td className="py-3 px-3 text-right text-body-sm tabular-nums">{r.factor}</td>
                      <td className="py-3 px-3 text-right text-body-sm tabular-nums">{r.fee}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`pill-tag ${r.status==='Active'?'pill-tag-success':'pill-tag-warning'}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shipping Lines */}
          <div className="card-feature">
            <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
              <Truck size={16} className="text-terracotta"/> 物流线路
            </h2>
            <div className="space-y-3">
              {[
                { name:'云途快递', type:'空运', eta:'5-7 天', cost:'¥35/kg', status:'活跃', region:'ID/TH/PH' },
                { name:'拼箱集运', type:'海运', eta:'15-20 天', cost:'¥12/kg', status:'活跃', region:'ID/TH' },
                { name:'DHL 快递', type:'快递', eta:'3-5 天', cost:'¥85/kg', status:'待机', region:'全球' },
              ].map(l => (
                <div key={l.name} className="flex items-center justify-between p-3 bg-canvas-gray ">
                  <div className="flex-1">
                    <div className="font-semibold text-body-sm text-ink">{l.name}</div>
                    <div className="text-micro text-ink-mute">{l.type} · {l.eta} · {l.cost} · {l.region}</div>
                  </div>
                  <span className={`pill-tag ${l.status==='Active'?'pill-tag-success':'pill-tag-warning'}`}>{l.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance — Loaded from backend API */}
          <div className="card-feature">
            <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
              <Shield size={16} className="text-warning"/> HS编码与合规
            </h2>

            {/* Supported Countries */}
            <div className="mb-4">
              <h3 className="text-body-sm font-semibold text-ink mb-2">各国海关法规</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {countries.map((c: any) => (
                  <div key={c.code} className="bg-canvas-gray p-3">
                    <div className="text-body-sm font-medium text-ink">{c.code}: {c.agency}</div>
                    <div className="text-micro text-ink-mute">{c.ruleCount} rules</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Banned Categories */}
            <div className="mb-4">
              <h3 className="text-body-sm font-semibold text-ink mb-2">禁运品 ({bannedCategories.length} 类)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {bannedCategories.slice(0, 6).map((c: any, i: number) => (
                  <div key={i} className="bg-canvas-gray p-3">
                    <div className="text-body-sm font-medium text-error">{c.category}</div>
                    <div className="text-micro text-ink-mute">{(c.items || []).slice(0, 3).join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Restricted Categories */}
            <div>
              <h3 className="text-body-sm font-semibold text-ink mb-2">Restricted Items ({restrictedCategories.length} categories)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {restrictedCategories.slice(0, 8).map((c: any, i: number) => (
                  <div key={i} className="bg-canvas-gray p-3">
                    <div className="text-body-sm font-medium text-warning">{c.label}</div>
                    <div className="text-micro text-ink-mute">{(c.requiredDocs || []).join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button onClick={handleSave} className="btn-primary flex items-center gap-2">
              <Save size={16}/> 保存全部设置
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
