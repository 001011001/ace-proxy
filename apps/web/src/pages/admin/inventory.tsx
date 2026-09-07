import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Settings, Save, RefreshCw, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

/**
 * InventoryPage - 利润与库存调优中心
 * 核心功能：批量利润调整器、一键推送生产库。
 */
export default function InventoryPage() {
  const [margin, setMargin] = useState(35);
  const [isPushing, setIsPushing] = useState(false);
  const productsApi = useApi<any>('/product/list?limit=10');

  const handlePush = async () => {
    setIsPushing(true);
    // Simulate push to Supabase
    setTimeout(() => {
      setIsPushing(false);
      alert(`✅ 成功将全局加价率调整为 ${margin}% 并同步至生产库。`);
    }, 1500);
  };

  return (
    <AdminLayout title="利润/库存调优">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bulk Margin Adjuster */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-feature">
            <h2 className="text-heading-sm font-display text-ink mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-terracotta"/> 批量利润调整器 (Bulk Margin Adjuster)
            </h2>
            
            <div className="bg-canvas-gray p-8 border-3 border-black shadow-[4px_4px_0_#000] mb-8">
               <label className="text-micro font-black text-ink-mute uppercase mb-4 block">全局加价率 (%)</label>
               <input 
                 type="range" min="15" max="60" value={margin} step="5" 
                 onChange={(e) => setMargin(parseInt(e.target.value))}
                 className="w-full h-3 bg-white border-2 border-black rounded-none appearance-none cursor-pointer accent-terracotta"
               />
               <div className="flex justify-between mt-4">
                  <span className="text-caption font-bold">15% (Competitive)</span>
                  <span className="text-display-md font-black text-terracotta">{margin}%</span>
                  <span className="text-caption font-bold">60% (Premium)</span>
               </div>
            </div>

            <div className="bg-warning-soft p-4 border border-warning/20 mb-8 flex items-start gap-3">
              <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5"/>
              <p className="text-body-sm text-ink-secondary">
                调整全局加价率将影响所有 <strong>DRAFT</strong> 状态的商品。已在售商品的价格建议手动微调以保持市场竞争力。
              </p>
            </div>

            <button 
              onClick={handlePush}
              disabled={isPushing}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 shadow-[6px_6px_0_#000]"
            >
              {isPushing ? <RefreshCw size={20} className="animate-spin"/> : <Save size={20}/>}
              {isPushing ? '正在同步至生产库...' : '一键推送至 Supabase 生产库'}
            </button>
          </div>

          <div className="card-feature">
            <h2 className="text-heading-sm font-display text-ink mb-4">待发布商品预览</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header border-b border-hairline">
                    <th className="text-left py-2.5 px-3">产品</th>
                    <th className="text-right py-2.5 px-3">1688 原价</th>
                    <th className="text-right py-2.5 px-3">预计售价 (IDR)</th>
                    <th className="text-right py-2.5 px-3">当前利润率</th>
                  </tr>
                </thead>
                <tbody>
                  {(productsApi.data?.items || []).slice(0, 5).map((p: any) => (
                    <tr key={p.id} className="border-b border-hairline hover:bg-canvas-gray">
                      <td className="py-3 px-3 font-medium text-body-sm">{p.name}</td>
                      <td className="py-3 px-3 text-right text-body-sm">¥{p.sourcePriceCNY || 45}</td>
                      <td className="py-3 px-3 text-right text-body-sm font-semibold">Rp {Math.round((p.sourcePriceCNY || 45) * 2200 * (1 + margin/100)).toLocaleString()}</td>
                      <td className="py-3 px-3 text-right text-body-sm font-bold text-success">{margin}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="space-y-6">
          <div className="card-feature bg-ink text-white">
            <h3 className="text-caption font-black text-terracotta uppercase mb-4">库存健康度</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-micro font-bold mb-1">
                  <span>雅加达北区仓库</span>
                  <span>78%</span>
                </div>
                <div className="w-full h-2 bg-white/10">
                  <div className="h-full bg-terracotta" style={{ width: '78%' }}/>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-micro font-bold mb-1">
                  <span>义乌中转仓</span>
                  <span>42%</span>
                </div>
                <div className="w-full h-2 bg-white/10">
                  <div className="h-full bg-terracotta" style={{ width: '42%' }}/>
                </div>
              </div>
            </div>
          </div>

          <div className="card-feature">
             <h3 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
               <Zap size={16} className="text-warning"/> 快速操作
             </h3>
             <div className="space-y-2">
                <button className="btn-outline w-full !text-xs !py-2">同步 1688 最新库存</button>
                <button className="btn-outline w-full !text-xs !py-2">清理零利差商品</button>
                <button className="btn-outline w-full !text-xs !py-2">导出补货清单 (PDF)</button>
             </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
