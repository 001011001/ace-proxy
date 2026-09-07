import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Globe, Plus, Edit, Trash2, MapPin, BarChart3 } from 'lucide-react';

export default function StationsPage() {
  const [stations, setStations] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ code: '', name: '', region: '', currency: 'IDR', language: 'id', timezone: 'Asia/Jakarta', domain: '' });

  useEffect(() => { fetchStations(); fetchStats(); }, []);

  const fetchStations = async () => {
    try {
      const res = await fetch('/api/admin/stations');
      if (!res.ok) return;
      const json = await res.json();
      const items = Array.isArray(json) ? json : json?.data;
      setStations(Array.isArray(items) ? items : []);
    } catch { }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stations/stats');
      if (!res.ok) return;
      const json = await res.json();
      const items = Array.isArray(json) ? json : json?.data;
      setStats(Array.isArray(items) ? items : []);
    } catch { }
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await fetch(`/api/admin/stations/${editing.code}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        });
      } else {
        await fetch('/api/admin/stations', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
        });
      }
      setShowForm(false); setEditing(null);
      setForm({ code: '', name: '', region: '', currency: 'IDR', language: 'id', timezone: 'Asia/Jakarta', domain: '' });
      fetchStations(); fetchStats();
    } catch { }
  };

  const handleDelete = async (code: string) => {
    if (!confirm('确定要停用此站点？')) return;
    await fetch(`/api/admin/stations/${code}`, { method: 'DELETE' });
    fetchStations();
  };

  return (
    <AdminLayout title="站点管理">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="text-heading-sm font-display font-semibold flex items-center gap-2">
                <Globe size={20} className="text-ocean" />
                站点列表
              </h3>
              <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary text-xs flex items-center gap-1">
                <Plus size={14} /> 新建站点
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink/8">
                    <th className="text-left py-3 px-4 text-ink-mute font-medium">代码</th>
                    <th className="text-left py-3 px-4 text-ink-mute font-medium">名称</th>
                    <th className="text-left py-3 px-4 text-ink-mute font-medium">区域</th>
                    <th className="text-left py-3 px-4 text-ink-mute font-medium">货币/语言</th>
                    <th className="text-left py-3 px-4 text-ink-mute font-medium">时区</th>
                    <th className="text-center py-3 px-4 text-ink-mute font-medium">状态</th>
                    <th className="text-right py-3 px-4 text-ink-mute font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {stations.map((s) => (
                    <tr key={s.code} className="border-b border-ink/5 hover:bg-ink/[0.02]">
                      <td className="py-3 px-4 font-mono font-semibold">{s.code}</td>
                      <td className="py-3 px-4">{s.name}</td>
                      <td className="py-3 px-4">{s.region}</td>
                      <td className="py-3 px-4">{s.currency} / {s.language}</td>
                      <td className="py-3 px-4 text-xs text-ink-mute">{s.timezone}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 text-[11px] font-medium ${s.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-ink/5 text-ink-mute'}`}>
                          {s.status === 'ACTIVE' ? '运营中' : '已停用'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => { setEditing(s); setForm({ code: s.code, name: s.name, region: s.region, currency: s.currency, language: s.language, timezone: s.timezone, domain: s.domain || '' }); setShowForm(true); }} className="btn-ghost !text-xs !px-2 !py-1 mr-1">
                          <Edit size={12} />
                        </button>
                        <button onClick={() => handleDelete(s.code)} className="btn-ghost !text-xs !px-2 !py-1 text-danger">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {stations.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-ink-mute">暂无站点，请点击"新建站点"</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 统计卡片 */}
          <div className="card">
            <div className="card-header">
              <h4 className="text-body font-semibold flex items-center gap-2"><BarChart3 size={16} className="text-terracotta" />站点业绩</h4>
            </div>
            <div className="p-3 space-y-3">
              {stats.map((s) => (
                <div key={s.code} className="flex items-center justify-between py-2 border-b border-ink/5 last:border-0">
                  <div>
                    <p className="text-sm font-semibold">{s.name} <span className="text-[10px] text-ink-mute">({s.code})</span></p>
                    <p className="text-[10px] text-ink-mute">{s.orders} 订单</p>
                  </div>
                  <p className="text-sm font-mono font-semibold">¥{s.gmv.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 新建/编辑表单 */}
          {showForm && (
            <div className="card border-2 border-ocean/30">
              <div className="card-header">
                <h4 className="text-body font-semibold">{editing ? '编辑站点' : '新建站点'}</h4>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="label-text text-xs">站点代码 *</label>
                  <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} disabled={!!editing}
                    placeholder="如 JKT, BKK" className="input-field w-full mt-1 text-sm" />
                </div>
                <div>
                  <label className="label-text text-xs">站点名称 *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="如 Jakarta" className="input-field w-full mt-1 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label-text text-xs">区域代码</label>
                    <input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}
                      placeholder="IDN" className="input-field w-full mt-1 text-sm" />
                  </div>
                  <div>
                    <label className="label-text text-xs">货币</label>
                    <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="input-field w-full mt-1 text-sm">
                      <option value="IDR">IDR (印尼盾)</option><option value="THB">THB (泰铢)</option>
                      <option value="PHP">PHP (比索)</option><option value="BRL">BRL (雷亚尔)</option>
                      <option value="GBP">GBP (英镑)</option><option value="JPY">JPY (日元)</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSubmit} className="btn-primary flex-1 text-sm">{editing ? '保存' : '创建'}</button>
                  <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn-outline text-sm">取消</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
