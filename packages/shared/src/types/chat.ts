/**
 * AI 管家聊天相关类型
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp?: string;
}

export interface StewardChatRequest {
  message: string;
  history: Array<{ role: string; content: string }>;
}

export interface StewardChatResponse {
  reply: string;
  toolUsed: string | null;
  toolData?: unknown[];
}

export interface ChatIntent {
  intent: 'search' | 'buy' | 'recommend' | 'qa' | 'translate' | 'tracking';
  confidence: number;
  entities?: Record<string, string>;
}
