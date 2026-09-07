import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Calendar, Sparkles, Eye, Check, AlertTriangle, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

interface HolidayConfig {
  id: string; name: string; startDate: string; endDate: string;
  region: string; status: 'active'|'planned'|'ended';
  uiTheme: string;
}

const UI_THEMES = [
  { name:'斋月暖色调', desc:'陶土色为主 · 金色点缀 · 新月图案 · 温暖渐变', type:'氛围增强版' },
  { name:'斋月简约', desc:'低调陶土色 · 纯净白色 · 最少装饰 · 聚焦产品', type:'极简版' },
  { name:'斋月激进', desc:'醒目徽章 · Neo-Brutalism · 倒计时 · 紧迫感驱动', type:'促销冲击版' },
];

const statusConfig: Record<string,{cls:string;label:string}> = {
  active: { cls:'pill-tag-success', label:'Active' },
  planned: { cls:'pill-tag-ocean', label:'Planned' },
  ended: { cls:'pill-tag-country', label:'Ended' },
};

function mapHoliday(h: any): HolidayConfig {
  return {
    id: h.id || h.stationId || 'N/A',
    name: h.festivalName || h.name || 'Unknown',
    startDate: h.startDate || h.dateRange?.start || '—',
    endDate: h.endDate || h.dateRange?.end || '—',
    region: h.region || h.country || 'Indonesia',
    status: h.isActive ? 'active' : (h.status === 'ended' ? 'ended' : 'planned'),
    uiTheme: h.themeId || h.uiTheme || 'Default',
  };
}

export default function HolidayPage() {
  const holidayApi = useApi<any>('/holiday/active-config?stationId=ID');
  const loading = holidayApi.loading;
  const error = holidayApi.error;

  const holidays: HolidayConfig[] = holidayApi.data
    ? [holidayApi.data].map(mapHoliday).filter(h => h.id !== 'N/A')
    : [];

  const [selectedHoliday, setSelectedHoliday] = useState<string>(
    holidays.length > 0 ? holidays[0].id : ''
  );
  const holiday = holidays.find(h=>h.id===selectedHoliday);

  return (
    <AdminLayout title="节假日管理" actions={
      error && <span className="pill-tag-warning !text-[10px]">API 离线</span>
    }>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-terracotta" />
          <span className="ml-2 text-ink-mute">加载节假日配置...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Holiday List + Theme Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Holiday List */}
            <div className="card-feature">
              <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-terracotta"/> 节假日日历
              </h2>
              <div className="space-y-3">
                {holidays.map(h => (
                  <button key={h.id} onClick={()=>setSelectedHoliday(h.id)}
                    className={`w-full text-left p-3 border transition-colors ${
                      selectedHoliday===h.id ? 'border-terracotta bg-terracotta-soft/50' : 'border-hairline hover:border-terracotta-soft'
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-body-sm">{h.name}</span>
                      <span className={statusConfig[h.status]?.cls || ''}>{statusConfig[h.status]?.label || h.status}</span>
                    </div>
                    <div className="text-micro text-ink-mute">
                      {h.startDate} → {h.endDate} · {h.region}
                    </div>
                  </button>
                ))}
              </div>
              <button className="btn-outline !text-xs w-full mt-4 flex items-center justify-center gap-1">
                <Calendar size={13}/> 添加节日
              </button>
            </div>

            {/* Right: Theme Selection */}
            <div className="lg:col-span-2 card-feature">
              <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-warning"/> 界面主题 — {holiday?.name}
              </h2>
              <div className="space-y-4">
                {UI_THEMES.map((t, i) => (
                  <div key={t.name} className={`p-4 border transition-colors ${
                    i===0 ? 'border-terracotta bg-terracotta-soft/30' : 'border-hairline hover:border-terracotta-soft'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-semibold text-ink flex items-center gap-2">
                          {t.name}
                          <span className="pill-tag-ocean !text-[10px]">{t.type}</span>
                        </div>
                        <div className="text-body-sm text-ink-secondary mt-1">{t.desc}</div>
                      </div>
                      {i===0 ? (
                        <span className="pill-tag-success flex items-center gap-1"><Check size={10}/> 当前使用</span>
                      ) : (
                        <button className="btn-primary !text-[10px] !px-3 !py-1">应用</button>
                      )}
                    </div>
                    <div className="mt-3 bg-canvas-gray p-3 flex items-center gap-3">
                      <div className="w-12 h-12 bg-terracotta flex items-center justify-center text-white font-bold text-xs">AP</div>
                      <div>
                        <div className="text-xs font-semibold text-ink">移动端首页 — {t.name}</div>
                        <div className="text-[10px] text-ink-mute">节日横幅 · 限时抢购计时器 · 爆品推荐</div>
                      </div>
                      <Eye size={14} className="text-ink-mute ml-auto"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stock Alert Config */}
          <div className="card-feature mt-6">
            <h2 className="text-heading-sm font-display text-ink mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-warning"/> 库存提醒阈值
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label:'节前天数', value:'14 天', desc:'激活移动端 Neo-Brutalism 提醒横幅' },
                { label:'最低库存', value:'50 件', desc:'每 SKU · 自动触发补货提醒' },
                { label:'自动切换UI', value:'已启用', desc:'开始日自动切换节日主题' },
                { label:'推送通知', value:'已启用', desc:'通知所有用户节日优惠' },
              ].map(c => (
                <div key={c.label} className="bg-canvas-gray p-4 text-center">
                  <div className="text-caption text-ink-mute mb-1">{c.label}</div>
                  <div className="text-heading-sm font-bold text-ink mb-1">{c.value}</div>
                  <div className="text-micro text-ink-mute">{c.desc}</div>
                </div>
              ))}
            </div>
            <button className="btn-primary !text-xs mt-4 flex items-center gap-1.5">
              <SettingsIcon size={13}/> 保存配置
            </button>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
