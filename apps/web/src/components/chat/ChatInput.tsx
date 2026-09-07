import { useState, useRef, useEffect } from 'react';
import { Send, Link2, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  sending: boolean;
}

export default function ChatInput({ onSend, sending }: ChatInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    onSend(text.trim());
    setText('');
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t-3 border-black bg-white p-3">
      {/* Paste link hint */}
      {text.trim() && isUrl(text.trim()) && (
        <span className="absolute -top-6 left-3 text-[9px] font-display font-bold text-ocean uppercase">
          <Link2 size={10} className="inline mr-1" /> Link terdeteksi — ArbiBot akan membandingkan harga
        </span>
      )}

      <textarea
        ref={inputRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Tanya atau tempel link produk..."
        rows={1}
        className="flex-1 resize-none border-2 border-black px-3 py-2 text-sm font-medium
          outline-none placeholder:text-ink-mute/40 bg-canvas-warm
          focus:border-terracotta transition-colors"
        disabled={sending}
      />

      <button
        type="submit"
        disabled={!text.trim() || sending}
        className={`flex-shrink-0 w-10 h-10 border-2 border-black flex items-center justify-center
          transition-all duration-100 ${text.trim() && !sending
            ? 'bg-terracotta text-white hover:translate-y-[-1px]'
            : 'bg-canvas-gray text-ink-mute/30 cursor-not-allowed'
          }`}
        style={{ boxShadow: text.trim() && !sending ? '2px 2px 0 #000' : 'none' }}>
        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
      </button>
    </form>
  );
}

function isUrl(text: string): boolean {
  try {
    const u = new URL(text.trim());
    return ['http:', 'https:'].includes(u.protocol);
  } catch { return false; }
}
