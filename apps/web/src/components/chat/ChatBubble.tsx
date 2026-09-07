import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/** Simple markdown-like text renderer (bold, links, line breaks) */
function renderContent(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-ink">$1</strong>')
    .replace(/\n/g, '<br/>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="text-ocean underline font-bold hover:text-terracotta">$1</a>');
}

export default function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 border-2 border-black flex items-center justify-center ${
        isUser ? 'bg-terracotta text-white' : 'bg-canvas-gray text-ink'
      }`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-3.5 py-2.5 border-3 border-black text-sm leading-relaxed ${
          isUser
            ? 'bg-white text-ink rounded-bl-lg'
            : 'bg-canvas-warm text-ink-secondary'
        }`}
          style={{ boxShadow: '2px 2px 0 #000' }}>
          <span
            className="[&_strong]:font-black [&_a]:text-ocean [&_a]:underline [&_a]:font-bold"
            dangerouslySetInnerHTML={{ __html: renderContent(content) }}
          />
        </div>
        <span className="text-[9px] font-display font-bold text-ink-mute/50 uppercase mt-1 block">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
