import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * AIChatFab — 全站悬浮 AI 管家
 *
 * 注意：后端 /chat/steward 使用 JwtAuthGuard。
 * 未登录时调用会返回 401，此处优雅降级为提示用户登录，而非抛错。
 */
export function AIChatFab() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 打开时聚焦输入框 + 注入问候语
  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([{ role: 'assistant', content: t('chat.greeting') }]);
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages.length, t]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setIsSending(true);

    try {
      const res = await chatApi.steward(text);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (err) {
      // 401 未登录 → 提示登录；其他 → 通用错误
      const isAuthError = err instanceof ApiError && err.status === 401;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isAuthError ? t('auth.loginTitle') : t('common.error'),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          'fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center',
          'rounded-full border-3 border-ink bg-terracotta text-white shadow-brutal-md',
          'transition-all duration-150 hover:bg-terracotta-press',
          'active:translate-x-[3px] active:translate-y-[3px] active:shadow-brutal-sm-press',
          isOpen && 'rotate-90',
        )}
        aria-label={t('chat.title')}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* 聊天面板 */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-24 right-6 z-[60] flex w-[min(92vw,380px)] flex-col',
            'animate-slide-up rounded-sm border-3 border-ink bg-white shadow-brutal-lg',
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-2 border-b-3 border-ink bg-terracotta px-lg2 py-md2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-white">
              <MessageCircle size={16} className="text-terracotta" />
            </div>
            <div>
              <h3 className="font-display text-heading-sm text-white">{t('chat.title')}</h3>
              <p className="font-body text-micro text-white/80">{t('chat.subtitle')}</p>
            </div>
          </div>

          {/* 消息列表 */}
          <div className="h-80 overflow-y-auto p-md2">
            <div className="flex flex-col gap-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-sm border-2 border-ink px-3 py-2',
                      'font-body text-body-sm',
                      msg.role === 'user' ? 'bg-terracotta text-white' : 'bg-canvas-warm text-ink',
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-sm border-2 border-ink bg-canvas-warm px-3 py-2">
                    <Loader2 size={14} className="animate-spin text-terracotta" />
                    <span className="font-body text-body-sm text-ink-mute">{t('chat.thinking')}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 输入区 */}
          <div className="flex items-center gap-2 border-t-3 border-ink p-sm2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              className="flex-1 rounded-pill border-3 border-ink bg-white px-4 py-2 font-body text-body-sm focus:border-terracotta focus:outline-none"
            />
            <button
              onClick={() => void handleSend()}
              disabled={!input.trim() || isSending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-3 border-ink bg-terracotta text-white transition-all active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
              aria-label={t('chat.send')}
            >
              <Send size={16} />
            </button>
          </div>

          {!isAuthenticated && (
            <p className="border-t-2 border-ink bg-warning-soft px-md2 py-2 text-center font-body text-micro text-ink">
              {t('auth.loginTitle')}
            </p>
          )}
        </div>
      )}
    </>
  );
}
