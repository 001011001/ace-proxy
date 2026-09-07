import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Bell, Send, MessageCircle, CheckCheck, Phone } from 'lucide-react';
// 使用统一 API service：自动指向后端 /api/v1（手写 /api/... 会缺 v1 前缀并打到前端自身端口）
import { api } from '@/services/api';

const TYPE_MAP: Record<string, { label: string; cls: string }> = {
  LOGISTIC: { label: '物流', cls: 'bg-ocean/10 text-ocean' },
  MARKETING: { label: '营销', cls: 'bg-accent/10 text-accent' },
  ALERT: { label: '告警', cls: 'bg-danger/10 text-danger' },
  SYSTEM: { label: '系统', cls: 'bg-ink/5 text-ink-mute' },
  LOGISTIC_UPDATE: { label: '物流', cls: 'bg-ocean/10 text-ocean' },
  MANUAL: { label: '手动', cls: 'bg-terracotta/10 text-terracotta' },
};

const CHANNEL_MAP: Record<string, string> = {
  IN_APP: '站内', WHATSAPP: 'WhatsApp', TELEGRAM: 'Telegram', PUSH: '推送',
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'list' | 'send'>('list');
  const [sendForm, setSendForm] = useState({ channel: 'WHATSAPP', target: '', message: '' });

  useEffect(() => { fetchNotifs(); }, []);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      // api service 已解包 ApiResponse，直接返回 data
      const data = await api.get<any[]>('/notifications?pageSize=50');
      setNotifs(data || []);
    } catch {
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifs();
    } catch { /* 后端不可用时静默失败，避免打断列表交互 */ }
  };

  const sendMessage = async () => {
    const endpoint = sendForm.channel === 'WHATSAPP' ? '/notifications/whatsapp' : '/notifications/telegram';
    const body = sendForm.channel === 'WHATSAPP'
      ? { phone: sendForm.target, text: sendForm.message, type: 'MANUAL' }
      : { chatId: sendForm.target, text: sendForm.message, type: 'MANUAL' };

    try {
      const result = await api.post<{ success?: boolean }>(endpoint, body);
      alert(result?.success ? '发送成功!' : '发送失败');
      setSendForm({ channel: 'WHATSAPP', target: '', message: '' });
      fetchNotifs();
    } catch {
      alert('发送失败：无法连接后端服务');
    }
  };

  return (
    <AdminLayout title="通知管理">
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('list')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold ${tab === 'list' ? 'bg-ocean text-white' : 'text-ink-secondary hover:bg-canvas-gray'}`}>
          <Bell size={15} /> 通知记录
        </button>
        <button onClick={() => setTab('send')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold ${tab === 'send' ? 'bg-ocean text-white' : 'text-ink-secondary hover:bg-canvas-gray'}`}>
          <Send size={15} /> 发送消息
        </button>
      </div>

      {tab === 'send' && (
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="text-heading-sm font-display font-semibold flex items-center gap-2">
              <MessageCircle size={18} className="text-ocean" /> 手动推送
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex gap-3">
              <button onClick={() => setSendForm({ ...sendForm, channel: 'WHATSAPP' })}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${sendForm.channel === 'WHATSAPP' ? 'bg-success/10 text-success border border-success/30' : 'bg-ink/5 text-ink-mute'}`}>
                <Phone size={16} /> WhatsApp
              </button>
              <button onClick={() => setSendForm({ ...sendForm, channel: 'TELEGRAM' })}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${sendForm.channel === 'TELEGRAM' ? 'bg-ocean/10 text-ocean border border-ocean/30' : 'bg-ink/5 text-ink-mute'}`}>
                <Send size={16} /> Telegram
              </button>
            </div>
            <div>
              <label className="label-text">{sendForm.channel === 'WHATSAPP' ? '手机号' : 'Chat ID'} *</label>
              <input value={sendForm.target} onChange={e => setSendForm({ ...sendForm, target: e.target.value })}
                placeholder={sendForm.channel === 'WHATSAPP' ? '+62812345678' : '-1001234567890'}
                className="input-field w-full mt-1 text-sm" />
            </div>
            <div>
              <label className="label-text">消息内容 *</label>
              <textarea value={sendForm.message} onChange={e => setSendForm({ ...sendForm, message: e.target.value })}
                rows={4} placeholder="输入要发送的消息..." className="input-field w-full mt-1 text-sm" />
            </div>
            <button onClick={sendMessage} disabled={!sendForm.target || !sendForm.message}
              className="btn-primary flex items-center gap-2">
              <Send size={14} /> 发送
            </button>
            <p className="text-[10px] text-ink-mute">
              {sendForm.channel === 'WHATSAPP'
                ? '需要配置 WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_ID 环境变量才能真实发送。当前为 mock 模式。'
                : '需要配置 TELEGRAM_BOT_TOKEN 环境变量才能真实发送。当前为 mock 模式。'}
            </p>
          </div>
        </div>
      )}

      {/* 通知列表 */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-heading-sm font-display font-semibold">通知记录</h3>
          <button onClick={fetchNotifs} className="btn-ghost text-xs">刷新</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/8">
                <th className="text-left py-3 px-4 text-ink-mute font-medium">类型</th>
                <th className="text-left py-3 px-4 text-ink-mute font-medium">渠道</th>
                <th className="text-left py-3 px-4 text-ink-mute font-medium">标题</th>
                <th className="text-left py-3 px-4 text-ink-mute font-medium">内容</th>
                <th className="text-center py-3 px-4 text-ink-mute font-medium">状态</th>
                <th className="text-right py-3 px-4 text-ink-mute font-medium">时间</th>
                <th className="text-right py-3 px-4 text-ink-mute font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-ink-mute">加载中...</td></tr>
              ) : notifs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-ink-mute">暂无通知</td></tr>
              ) : notifs.map((n: any) => {
                const t = TYPE_MAP[n.type] || { label: n.type, cls: 'bg-ink/5' };
                return (
                  <tr key={n.id} className="border-b border-ink/5 hover:bg-ink/[0.02]">
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 text-[11px] font-medium ${t.cls}`}>{t.label}</span></td>
                    <td className="py-3 px-4 text-xs">{CHANNEL_MAP[n.channel] || n.channel}</td>
                    <td className="py-3 px-4 font-medium max-w-[150px] truncate">{n.title}</td>
                    <td className="py-3 px-4 text-ink-mute max-w-[200px] truncate">{n.body}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 text-[11px] ${n.status === 'READ' ? 'bg-success/10 text-success' : n.status === 'SENT' ? 'bg-ocean/10 text-ocean' : 'bg-warning/10 text-warning'}`}>
                        {n.status === 'READ' ? '已读' : n.status === 'SENT' ? '已发送' : n.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-ink-mute">
                      {new Date(n.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {n.status !== 'READ' && (
                        <button onClick={() => markRead(n.id)} className="text-[11px] px-2 py-1 rounded bg-ink/5 hover:bg-ink/10">
                          <CheckCheck size={12} className="inline mr-1" />标记已读
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
    </AdminLayout>
  );
}
