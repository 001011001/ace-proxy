import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Headphones, MessageCircle, User, Clock, CheckCircle2, AlertCircle,
  Bot, Send, ArrowRight, RefreshCw, Search, ChevronDown,
  UserCheck, Sparkles, TrendingUp, BarChart3, Zap, Wrench,
  Package, Truck, ShoppingCart, CreditCard, BookOpen,
} from 'lucide-react';

/** 从后端 /customer-service/recent-chats 获取的数据 */
interface RecentChat {
  userId: string;
  source: 'AI_AUTO' | 'HUMAN';
  message: string;
  reply: string;
  confidence: number;
  needsHuman: boolean;
  toolUsed?: string;
  createdAt: string;
}

/** 后端 /customer-service/stats 返回 */
interface CSStats {
  totalConversations: number;
  totalMessages?: number;
  aiResolved: number;
  humanTakeover: number;
  autoResolveRate: string;
  avgResponseTime: string;
  avgHumanResponseTime?: string;
  satisfactionScore: number | null;
  faqHitRate: number;
  topFaqCategories: Array<{ category: string; count: number; pct: number }>;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'human' | 'tool';
  content: string;
  timestamp: string;
  toolUsed?: string;
}

interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userLevel: string;
  lastMessage: string;
  lastMessageAt: string;
  status: 'AI_AUTO' | 'AI_REPLY' | 'NEEDS_HUMAN' | 'HUMAN_REPLY' | 'RESOLVED';
  unreadCount: number;
  orderId?: string;
  messages: ChatMessage[];
  toolUsed?: string;
  confidence: number;
}

const STATUS_MAP: Record<string, { label: string; icon: any; className: string }> = {
  AI_AUTO: { label: 'AI全自动', icon: Zap, className: 'bg-success/10 text-success border-success' },
  AI_REPLY: { label: 'AI已回复', icon: Bot, className: 'bg-ocean/10 text-ocean border-ocean' },
  NEEDS_HUMAN: { label: '需人工', icon: AlertCircle, className: 'bg-error/10 text-error border-error' },
  HUMAN_REPLY: { label: '人工处理中', icon: UserCheck, className: 'bg-warning/10 text-warning border-warning' },
  RESOLVED: { label: '已解决', icon: CheckCircle2, className: 'bg-success/10 text-success border-success' },
};

/** 工具名称 ⇒ 图标映射 */
const TOOL_ICONS: Record<string, any> = {
  checkOrderStatus: ShoppingCart,
  trackLogistics: Truck,
  getUserOrders: Package,
  estimateShipping: Truck,
  searchFAQ: BookOpen,
  cancelOrder: AlertCircle,
};

export default function CustomerServicePage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<'all' | 'needs_human' | 'human' | 'resolved'>('all');
  const [stats, setStats] = useState<CSStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // ─── 加载真实数据 ───
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [chatsRes, statsRes] = await Promise.all([
        fetch('/customer-service/recent-chats').then(r => r.json()),
        fetch('/customer-service/stats').then(r => r.json()),
      ]);

      // 解析统计数据
      setStats(statsRes);

      // 将 recent-chats 转为 session 列表
      const sessionMap = new Map<string, ChatSession>();
      for (const chat of (chatsRes as RecentChat[]) || []) {
        const sid = `sess-${chat.userId || 'anon'}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        if (!sessionMap.has(sid)) {
          sessionMap.set(sid, {
            id: sid,
            userId: chat.userId || 'anon',
            userName: chat.userId ? `User ${chat.userId.slice(0, 6)}` : 'Anonymous',
            userLevel: 'MEMBER',
            lastMessage: chat.message,
            lastMessageAt: chat.createdAt,
            status: chat.needsHuman ? 'NEEDS_HUMAN' : (chat.toolUsed ? 'AI_AUTO' : 'AI_REPLY'),
            unreadCount: chat.needsHuman ? 1 : 0,
            toolUsed: chat.toolUsed,
            confidence: chat.confidence,
            messages: [
              { id: `u-${Date.now()}`, role: 'user', content: chat.message, timestamp: chat.createdAt },
              { id: `a-${Date.now()}`, role: 'assistant', content: chat.reply, timestamp: chat.createdAt, toolUsed: chat.toolUsed },
            ],
          });
        }
      }

      const sessionList = Array.from(sessionMap.values());
      setSessions(sessionList);

      // 如果当前选中 session 在列表里，则保持选中
      if (selectedSession) {
        const stillExists = sessionList.find(s => s.id === selectedSession.id);
        if (stillExists) setSelectedSession(stillExists);
        else if (sessionList.length > 0) setSelectedSession(sessionList[0]);
      } else if (sessionList.length > 0) {
        setSelectedSession(sessionList[0]);
      }
    } catch (e) {
      console.warn('[CS Panel] Failed to load data, using defaults:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // 每 30 秒自动刷新
  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // ─── 筛选 ───
  const filtered = sessions.filter(s => {
    if (filter === 'needs_human') return s.status === 'NEEDS_HUMAN';
    if (filter === 'human') return s.status === 'HUMAN_REPLY';
    if (filter === 'resolved') return s.status === 'RESOLVED';
    return true;
  }).filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.userName.toLowerCase().includes(q) || s.lastMessage.toLowerCase().includes(q);
  });

  const needsHumanCount = sessions.filter(s => s.status === 'NEEDS_HUMAN').length;
  const humanCount = sessions.filter(s => s.status === 'HUMAN_REPLY').length;
  const aiAutoCount = sessions.filter(s => s.status === 'AI_AUTO').length;
  const resolvedCount = sessions.filter(s => s.status === 'RESOLVED').length;

  // ─── 操作 ───
  function handleSendReply() {
    if (!replyText.trim() || !selectedSession) return;
    setSending(true);
    setTimeout(() => {
      const newMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'human',
        content: replyText.trim(),
        timestamp: new Date().toISOString(),
      };
      setSessions(prev => prev.map(s =>
        s.id === selectedSession.id
          ? { ...s, messages: [...s.messages, newMsg], lastMessage: replyText.trim(), status: 'HUMAN_REPLY' as const }
          : s
      ));
      setSelectedSession(prev => prev ? { ...prev, messages: [...prev.messages, newMsg], lastMessage: replyText.trim(), status: 'HUMAN_REPLY' } : null);
      setReplyText('');
      setSending(false);
    }, 300);
  }

  function handleTakeOver(session: ChatSession) {
    setSessions(prev => prev.map(s =>
      s.id === session.id ? { ...s, status: 'HUMAN_REPLY' as const } : s
    ));
    if (selectedSession?.id === session.id) {
      setSelectedSession({ ...session, status: 'HUMAN_REPLY' });
    }
  }

  function handleResolve(session: ChatSession) {
    setSessions(prev => prev.map(s =>
      s.id === session.id ? { ...s, status: 'RESOLVED' as const, unreadCount: 0 } : s
    ));
    if (selectedSession?.id === session.id) {
      setSelectedSession({ ...session, status: 'RESOLVED', unreadCount: 0 });
    }
  }

  // ─── 加载订单上下文 ───
  async function loadOrderContext(orderId: string) {
    try {
      const res = await fetch(`/customer-service/order-context/${orderId}`);
      if (res.ok) return await res.json();
    } catch { /* ignore */ }
    return null;
  }

  // ─── UI ───
  return (
    <AdminLayout title="客服工作台 · AI 全自动" actions={
      <div className="flex items-center gap-2">
        {needsHumanCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 border-2 border-error bg-error/10 text-error text-[11px] font-display font-bold uppercase animate-pulse">
            <AlertCircle size={12} /> {needsHumanCount} 待人工
          </span>
        )}
        <span className="inline-flex items-center gap-1 px-2.5 py-1 border-2 border-success bg-success/10 text-success text-[11px] font-display font-bold uppercase">
          <Zap size={12} /> {aiAutoCount} 已自动
        </span>
        <button onClick={loadData} disabled={loading}
          className="btn-brutal-xs-outline flex items-center gap-1">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> 刷新
        </button>
      </div>
    }>
      <div className="flex gap-6 h-[calc(100vh-170px)]">
        {/* ─── LEFT: Session List ─── */}
        <div className="w-[360px] flex flex-col border-4 border-black bg-white shrink-0"
          style={{ boxShadow: '4px 4px 0 #000' }}>
          {/* Filter Tabs */}
          <div className="flex border-b-4 border-black">
            {[
              { key: 'all', label: '全部', count: sessions.length, active: filter === 'all' },
              { key: 'needs_human', label: '需人工', count: needsHumanCount, active: filter === 'needs_human' },
              { key: 'human', label: '处理中', count: humanCount, active: filter === 'human' },
              { key: 'resolved', label: '已解决', count: resolvedCount, active: filter === 'resolved' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key as any)}
                className={`flex-1 py-2.5 text-[10px] font-display font-bold uppercase transition-colors border-r-2 border-black last:border-r-0
                  ${tab.active ? 'bg-terracotta text-white' : 'bg-white text-ink-mute hover:bg-canvas-gray'}`}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="p-3 border-b-2 border-black/10">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索用户或消息..."
                className="w-full pl-9 pr-3 py-2 border-2 border-black text-xs font-medium outline-none focus:border-terracotta bg-canvas-warm" />
            </div>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center py-10 text-ink-mute text-xs font-bold">
                <RefreshCw size={20} className="mx-auto mb-2 animate-spin" />
                加载中...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 px-6">
                <Headphones size={36} className="mx-auto mb-3 text-ink-mute/25" />
                <p className="font-display font-bold text-ink-mute text-sm mb-1">暂无客服会话</p>
                <p className="text-[11px] text-ink-mute/60 leading-relaxed">
                  当前没有用户发起过客服咨询。<br />
                  用户可通过 App 内的"客服"入口发起对话，<br />
                  AI 将自动处理 FAQ 并智能分流。
                </p>
              </div>
            ) : filtered.map(session => {
              const statusInfo = STATUS_MAP[session.status] || STATUS_MAP.AI_REPLY;
              const StatusIcon = statusInfo.icon;
              const isSelected = selectedSession?.id === session.id;
              return (
                <button key={session.id} onClick={() => setSelectedSession(session)}
                  className={`w-full text-left p-3 border-b border-black/5 transition-colors relative
                    ${isSelected ? 'bg-terracotta/5 border-l-4 border-l-terracotta' : 'hover:bg-canvas-gray border-l-4 border-l-transparent'}`}>
                  {session.unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-error text-white text-[9px] font-display font-black flex items-center justify-center border-2 border-black">
                      {session.unreadCount}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`w-7 h-7 border-2 border-black flex items-center justify-center flex-shrink-0
                      ${session.status === 'AI_AUTO' ? 'bg-success/20' : session.status === 'NEEDS_HUMAN' ? 'bg-error/20' : 'bg-canvas-gray'}`}>
                      <User size={14} className="text-ink-mute" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-ink truncate">{session.userName}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-ink-mute font-mono">
                      {new Date(session.lastMessageAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-secondary line-clamp-2 leading-relaxed mb-1.5">{session.lastMessage}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-display font-bold uppercase border ${statusInfo.className}`}>
                      <StatusIcon size={10} /> {statusInfo.label}
                    </span>
                    {session.toolUsed && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono text-ink-mute bg-canvas-gray border border-black">
                        <Wrench size={9} /> {session.toolUsed}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── RIGHT: Chat Panel ─── */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-4 border-black bg-white mb-4"
                style={{ boxShadow: '4px 4px 0 #000' }}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 border-3 border-black flex items-center justify-center
                    ${selectedSession.status === 'AI_AUTO' ? 'bg-success/20' : 'bg-canvas-gray'}`}>
                    <User size={18} className="text-ink-mute" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm text-ink">{selectedSession.userName}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-display font-bold uppercase px-1.5 py-0.5 border ${STATUS_MAP[selectedSession.status]?.className}`}>
                        {STATUS_MAP[selectedSession.status]?.label}
                      </span>
                      {selectedSession.toolUsed && (
                        <span className="text-[9px] font-mono text-success bg-success/10 border border-success px-1.5 py-0.5">
                          <Wrench size={9} className="inline mr-0.5" />{selectedSession.toolUsed}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedSession.status === 'NEEDS_HUMAN' && (
                    <button onClick={() => handleTakeOver(selectedSession)}
                      className="btn-brutal-xs flex items-center gap-1">
                      <UserCheck size={12} /> 接管
                    </button>
                  )}
                  {(selectedSession.status === 'HUMAN_REPLY' || selectedSession.status === 'AI_AUTO' || selectedSession.status === 'AI_REPLY') && (
                    <button onClick={() => handleResolve(selectedSession)}
                      className="btn-brutal-xs-outline flex items-center gap-1 text-success border-success">
                      <CheckCircle2 size={12} /> 标记解决
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 flex gap-4 min-h-0">
                {/* Messages */}
                <div className="flex-1 flex flex-col border-4 border-black bg-white"
                  style={{ boxShadow: '4px 4px 0 #000' }}>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {selectedSession.messages.map((msg, i) => {
                      const ToolIcon = msg.toolUsed ? (TOOL_ICONS[msg.toolUsed] || Wrench) : null;
                      return (
                        <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? '' : 'flex-row-reverse'}`}>
                          <div className={`w-8 h-8 border-2 border-black flex items-center justify-center flex-shrink-0
                            ${msg.role === 'user' ? 'bg-canvas-gray'
                              : msg.role === 'human' ? 'bg-terracotta'
                              : msg.role === 'tool' ? 'bg-warning'
                              : msg.toolUsed ? 'bg-success' : 'bg-ocean'}`}>
                            {msg.role === 'user' ? <User size={14} />
                              : msg.role === 'human' ? <Headphones size={14} className="text-white" />
                              : msg.role === 'tool' ? <Wrench size={14} className="text-white" />
                              : msg.toolUsed ? <Zap size={14} className="text-white" />
                              : <Bot size={14} className="text-white" />}
                          </div>
                          <div className={`max-w-[75%] px-3 py-2 border-2 border-black text-xs leading-relaxed
                            ${msg.role === 'user' ? 'bg-canvas-warm'
                              : msg.role === 'human' ? 'bg-terracotta/10 border-terracotta'
                              : msg.role === 'tool' ? 'bg-warning/10 border-warning'
                              : msg.toolUsed ? 'bg-success/10 border-success' : 'bg-ocean/10 border-ocean'}`}>
                            {msg.toolUsed && (
                              <div className="flex items-center gap-1 mb-1 text-[9px] font-display font-bold text-success uppercase">
                                {ToolIcon && <ToolIcon size={10} />} {msg.toolUsed}
                              </div>
                            )}
                            <p className="font-medium text-ink">{msg.content}</p>
                            <span className="text-[9px] text-ink-mute font-mono mt-1 block">
                              {new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Reply Input */}
                  <div className="border-t-4 border-black p-3 bg-canvas-warm">
                    <div className="flex gap-2">
                      <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                        placeholder="输入人工回复... (Shift+Enter 换行)"
                        rows={2}
                        className="flex-1 resize-none border-2 border-black px-3 py-2 text-xs font-medium outline-none focus:border-terracotta bg-white"
                        disabled={sending} />
                      <button onClick={handleSendReply} disabled={!replyText.trim() || sending}
                        className={`flex-shrink-0 px-4 border-2 border-black flex items-center justify-center transition-all
                          ${replyText.trim() && !sending ? 'bg-terracotta text-white hover:translate-y-[-1px]' : 'bg-canvas-gray text-ink-mute cursor-not-allowed'}`}
                        style={{ boxShadow: replyText.trim() && !sending ? '2px 2px 0 #000' : 'none' }}>
                        {sending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-display font-bold text-ink-mute uppercase">
                        {needsHumanCount > 0
                          ? `⚠️ 有 ${needsHumanCount} 条会话需人工处理`
                          : '✅ 全部会话已自动处理'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ─── Right Sidebar: AI Auto-Processing Status ─── */}
                <div className="w-[260px] border-4 border-black bg-white shrink-0 overflow-y-auto"
                  style={{ boxShadow: '4px 4px 0 #000' }}>
                  {/* AI 处理状态 */}
                  <div className="p-4 border-b-4 border-black bg-success/5">
                    <h3 className="font-display font-black text-xs text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Zap size={14} className="text-success" /> AI 处理状态
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-ink-mute font-bold">处理方式</span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-display font-bold uppercase border ${STATUS_MAP[selectedSession.status]?.className}`}>
                          {selectedSession.status === 'AI_AUTO' ? '全自动'
                            : selectedSession.status === 'AI_REPLY' ? 'AI回复'
                            : selectedSession.status === 'NEEDS_HUMAN' ? '待人工'
                            : selectedSession.status === 'HUMAN_REPLY' ? '人工处理中'
                            : '已解决'}
                        </span>
                      </div>
                      {selectedSession.toolUsed && (
                        <div className="flex justify-between">
                          <span className="text-ink-mute font-bold">使用工具</span>
                          <span className="font-bold text-success">{selectedSession.toolUsed}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-ink-mute font-bold">置信度</span>
                        <span className={`font-bold ${selectedSession.confidence >= 0.7 ? 'text-success' : selectedSession.confidence >= 0.4 ? 'text-warning' : 'text-error'}`}>
                          {Math.round(selectedSession.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 h-1.5 border-2 border-black bg-white">
                      <div className={`h-full transition-all ${
                        selectedSession.confidence >= 0.7 ? 'bg-success'
                          : selectedSession.confidence >= 0.4 ? 'bg-warning'
                          : 'bg-error'
                      }`} style={{ width: `${Math.round(selectedSession.confidence * 100)}%` }} />
                    </div>
                  </div>

                  {/* 用户画像 */}
                  <div className="p-4 border-b-4 border-black">
                    <h3 className="font-display font-black text-xs text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <BarChart3 size={14} className="text-terracotta" /> 用户信息
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-ink-mute font-bold">User ID</span>
                        <span className="font-mono font-bold text-ink text-[10px]">{selectedSession.userId?.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-mute font-bold">等级</span>
                        <span className="font-bold text-terracotta">{selectedSession.userLevel || 'MEMBER'}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI 处理流程图 */}
                  <div className="p-4 border-b-4 border-black">
                    <h3 className="font-display font-black text-xs text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-terracotta" /> 处理流程
                    </h3>
                    <div className="space-y-2">
                      {[
                        { label: 'FAQ 匹配', done: true, desc: '关键词匹配' },
                        { label: 'Tool Calling', done: !!selectedSession.toolUsed, desc: selectedSession.toolUsed || '无需工具' },
                        { label: 'RAG 知识库', done: true, desc: '政策文档注入' },
                        { label: '对话记忆', done: true, desc: '多轮上下文' },
                        { label: 'AI 回复', done: selectedSession.status !== 'NEEDS_HUMAN', desc: selectedSession.status === 'NEEDS_HUMAN' ? '已转人工' : '已完成' },
                      ].map((step, i) => (
                        <div key={i} className="flex items-start gap-2 text-[10px]">
                          <div className={`w-4 h-4 border-2 border-black flex items-center justify-center flex-shrink-0 mt-0.5
                            ${step.done ? 'bg-success text-white' : 'bg-canvas-gray text-ink-mute'}`}>
                            {step.done ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                          </div>
                          <div>
                            <div className={`font-bold ${step.done ? 'text-ink' : 'text-ink-mute'}`}>{step.label}</div>
                            <div className="text-ink-mute">{step.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI 快捷建议 */}
                  <div className="p-4">
                    <h3 className="font-display font-black text-xs text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-terracotta" /> 快捷回复
                    </h3>
                    <div className="space-y-2">
                      {[
                        'Pesanan Anda sedang kami proses. Silakan cek halaman "Pesanan Saya" untuk tracking real-time.',
                        'Mohon maaf atas ketidaknyamanan. Tim kami akan segera menindaklanjuti.',
                        'Untuk klaim, silakan kirim foto produk yang diterima melalui chat ini.',
                      ].map((suggestion, i) => (
                        <button key={i} onClick={() => setReplyText(suggestion)}
                          className="w-full text-left p-2.5 border-2 border-black bg-canvas-warm text-[11px] font-medium text-ink-secondary hover:bg-terracotta/10 hover:border-terracotta transition-colors leading-relaxed"
                          style={{ boxShadow: '1.5px 1.5px 0 #000' }}>
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center border-4 border-black bg-white"
              style={{ boxShadow: '4px 4px 0 #000' }}>
              <div className="text-center max-w-sm">
                <Headphones size={48} className="mx-auto mb-4 text-ink-mute/20" />
                <p className="font-display font-bold text-ink-mute text-sm mb-2">
                  {loading ? '正在加载数据...' : sessions.length === 0 ? '等待用户发起客服对话' : '请从左侧选择会话查看详情'}
                </p>
                <p className="text-[11px] text-ink-mute/60 leading-relaxed">
                  {loading ? '请稍候，正在从服务器获取最新数据。' : sessions.length === 0 ? (
                    <>AI 客服已就绪，可处理 FAQ、查订单、查物流等常见问题。<br />
                    用户通过 App 发起聊天后，会话将自动出现在左侧列表。</>
                  ) : (
                    <>选择一个会话可查看完整的对话历史、AI 处理流程，<br />以及用户画像和快捷回复建议。</>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Bottom Stats Bar ─── */}
      <div className="grid grid-cols-5 gap-3 mt-4">
        {[
          { label: '今日会话', value: stats?.totalConversations ?? '-', icon: <MessageCircle size={14} />, color: 'text-ocean' },
          { label: 'AI 自动解决', value: stats?.aiResolved ?? '-', icon: <Zap size={14} />, color: 'text-success' },
          { label: '自动解决率', value: stats?.autoResolveRate ?? '-', icon: <TrendingUp size={14} />, color: 'text-accent' },
          { label: '平均响应', value: stats?.avgResponseTime ?? '-', icon: <Clock size={14} />, color: 'text-terracotta' },
          { label: '满意度', value: stats?.satisfactionScore != null ? `${stats.satisfactionScore}/5` : '—', icon: <Sparkles size={14} />, color: 'text-accent' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border-3 border-black p-3 flex items-center gap-3" style={{ boxShadow: '3px 3px 0 #000' }}>
            <span className={stat.color}>{stat.icon}</span>
            <div>
              <div className={`text-lg font-display font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-[9px] font-display font-bold text-ink-mute uppercase">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
