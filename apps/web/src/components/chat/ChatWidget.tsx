import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Bot, Minimize2, Maximize2, Trash2, Link2, Package, Search, CreditCard } from 'lucide-react';
import { useChatService } from './useChatService';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

/**
 * ChatWidget — 全站右下角悬浮 AI 管家 (AI Concierge)
 * 
 * 功能：
 * - 悬浮按钮（Neo-Brutalism 风格）
 * - 展开/最小化面板
 * - 支持文本聊天 + 粘贴链接自动触发 ArbiBot 比价
 * - 快捷操作按钮（粘贴链接、查订单、问运费、问支付）
 * - 自动回退智能回复（当后端离线时）
 * - 键盘快捷键：Escape 关闭
 */
const QUICK_ACTIONS = [
  { icon: <Link2 size={14} />, label: 'Paste link', prompt: 'Paste a Shopee/Tokopedia/Amazon link for price comparison' },
  { icon: <Search size={14} />, label: 'Find products', prompt: 'I want to find fashion products from China' },
  { icon: <Package size={14} />, label: 'My orders', prompt: 'Where is my order? How do I track it?' },
  { icon: <CreditCard size={14} />, label: 'Payment help', prompt: 'What payment methods do you accept?' },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, sending, sendMessage, clearMessages } = useChatService();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Welcome message on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      sendMessage('help');
    }
  }, [open]);

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setNotificationCount(0); }}
          className="fixed bottom-5 right-5 z-[999] w-14 h-14 border-4 border-black bg-terracotta text-white
            flex items-center justify-center
            hover:translate-y-[-2px] active:translate-y-[1px]
            transition-all duration-150"
          style={{ boxShadow: '4px 4px 0 #000' }}
          aria-label="Chat with AI assistant">
          <MessageCircle size={26} />
          {/* Active indicator */}
          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-success border-2 border-black rounded-full animate-pulse" />
          {/* Notification badge */}
          {notificationCount > 0 && (
            <span className="absolute -top-2 -left-2 w-6 h-6 bg-white border-2 border-black text-ink text-[10px] font-display font-black flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div
          className={`fixed z-[999] border-4 border-black bg-white
            transition-all duration-300 ease-out
            ${minimized
              ? 'bottom-5 right-5 w-64 h-12'
              : 'bottom-5 right-5 w-[92vw] sm:w-[380px] h-[520px] max-h-[80vh]'
            }`}
          style={{ boxShadow: '6px 6px 0 #000' }}>
          
          {/* Header */}
          <div className="flex items-center justify-between bg-ink text-white px-3.5 py-2.5 border-b-4 border-black">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 border-2 border-white bg-terracotta flex items-center justify-center flex-shrink-0">
                <Bot size={14} className="text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-display font-black text-sm tracking-tight block leading-none">
                  ArbiBot AI
                </span>
                {!minimized && (
                  <span className="text-[9px] text-white/50 font-bold uppercase block leading-none mt-0.5">
                    {sending ? 'Mengetik...' : 'Online'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!minimized && messages.length > 0 && (
                <button
                  onClick={clearMessages}
                  className="w-6 h-6 border-2 border-white/20 flex items-center justify-center
                    hover:bg-white/10 transition-colors"
                  title="Clear chat">
                  <Trash2 size={12} />
                </button>
              )}
              <button
                onClick={() => setMinimized(!minimized)}
                className="w-6 h-6 border-2 border-white/20 flex items-center justify-center
                  hover:bg-white/10 transition-colors"
                title={minimized ? 'Maximize' : 'Minimize'}>
                {minimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-6 h-6 border-2 border-white/20 flex items-center justify-center
                  hover:bg-white/10 transition-colors"
                title="Close">
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Body (hidden when minimized) */}
          {!minimized && (
            <>
              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3.5 space-y-3.5"
                style={{ height: 'calc(100% - 100px)' }}>
                {messages.length === 0 && !sending && (
                  <div className="text-center py-6 space-y-3">
                    <Bot size={36} className="mx-auto mb-2 text-ink-mute/30" />
                    <p className="text-xs text-ink-mute font-bold">
                      👋 Hi! I'm your <strong className="text-terracotta">AI shopping concierge</strong>.<br/>
                      Paste a product link or ask me anything!
                    </p>
                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {QUICK_ACTIONS.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(action.prompt)}
                          className="flex items-center gap-1.5 px-2.5 py-2 border-2 border-black bg-white hover:bg-canvas-gray text-[10px] font-display font-bold text-ink-mute uppercase transition-colors"
                          style={{ boxShadow: '1.5px 1.5px 0 #000' }}>
                          <span className="text-terracotta">{action.icon}</span>
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map(msg => (
                  <ChatBubble
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    timestamp={msg.timestamp}
                  />
                ))}
                {sending && (
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 border-2 border-black bg-canvas-gray flex items-center justify-center">
                      <Bot size={16} />
                    </div>
                    <div className="flex gap-1.5 items-center px-3 py-2.5 border-3 border-black bg-canvas-warm">
                      {[0, 1, 2].map(i => (
                        <div key={i}
                          className="w-2 h-2 border-2 border-black bg-terracotta"
                          style={{ animation: `bounce 0.5s ${i * 0.1}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <ChatInput onSend={sendMessage} sending={sending} />
            </>
          )}
        </div>
      )}

      {/* Keyframes for typing animation */}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
