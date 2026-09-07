import { useState, useCallback, useRef } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  /** True if content was pasted as a product link → trigger ArbiBot */
  isProductLink?: boolean;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('aceproxy_token'); } catch { return null; }
}

/**
 * useChatService — 连接后端 /api/v1/chat/message 端点
 * 支持文本消息 + 粘贴链接自动触发 ArbiBot 分析
 */
export function useChatService() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const isProductUrl = (text: string): boolean => {
    const trimmed = text.trim();
    try {
      const u = new URL(trimmed);
      const host = u.hostname.toLowerCase();
      return host.includes('shopee') || host.includes('tokopedia') ||
             host.includes('amazon') || host.includes('lazada') ||
             host.includes('tiktok') || host.includes('1688') ||
             host.includes('taobao') || host.includes('blibli') ||
             host.includes('bukalapak');
    } catch {
      return false;
    }
  };

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const isLink = isProductUrl(trimmed);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
      isProductLink: isLink,
    };
    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    // Cancel previous request if any
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = getAuthToken();

      if (isLink) {
        // ArbiBot product link → call arbitrage analysis
        const arbRes = await fetch('/arbibot/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ url: trimmed }),
          signal: controller.signal,
        });

        if (arbRes.ok) {
          const data = await arbRes.json();
          if (data.sourcePriceCNY > 0) {
            const allInIDR = Math.round(data.allInPriceIDR);
            const marketIDR = Math.round(allInIDR * 2.34);
            const saved = marketIDR - allInIDR;
            const margin = data.arbitrageGapPct ? Math.round(data.arbitrageGapPct * 100) : 0;

            setMessages(prev => [...prev, {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: `🔍 **Found on 1688!** Factory price: **¥${data.sourcePriceCNY.toFixed(0)}**\n\n💰 AceProxy price: **Rp ${allInIDR.toLocaleString()}**\n📊 Market price: ~Rp ${marketIDR.toLocaleString()}\n💸 You save: **Rp ${saved.toLocaleString()}** (${margin}% margin)\n\n🔗 [View source](${data.matchedSourceUrl})`,
              timestamp: Date.now(),
            }]);
          } else {
            setMessages(prev => [...prev, {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: '😕 I couldn\'t find a matching product on 1688 for this link. Try another product or search by keyword instead.',
              timestamp: Date.now(),
            }]);
          }
        } else {
          throw new Error('ArbiBot analysis failed');
        }
      } else {
        // Regular chat message
        const chatRes = await fetch('/api/v1/chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ message: trimmed }),
          signal: controller.signal,
        });

        if (chatRes.ok) {
          const data = await chatRes.json();
          setMessages(prev => [...prev, {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: data.reply || data.message || 'I understand! Let me help you with that.',
            timestamp: Date.now(),
          }]);
        } else {
          // Fallback smart replies
          const fallback = getSmartReply(trimmed);
          setMessages(prev => [...prev, {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: fallback,
            timestamp: Date.now(),
          }]);
        }
      }
    } catch {
      // Network error fallback
      const fallback = isLink
        ? '🔌 Unable to reach ArbiBot right now. Please try again or browse our [product catalog](/products).'
        : getSmartReply(trimmed);
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: fallback,
        timestamp: Date.now(),
      }]);
    } finally {
      setSending(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, sending, sendMessage, clearMessages };
}

/** Smart fallback replies when chat API is offline */
function getSmartReply(text: string): string {
  const lower = text.toLowerCase();

  if (lower.includes('price') || lower.includes('harga') || lower.includes('biaya') || lower.includes('cost'))
    return '💡 Our prices are direct from 1688 factories, typically 50-200% cheaper than local marketplaces. [Browse products](/products) or paste a product link for a direct comparison!';

  if (lower.includes('ship') || lower.includes('kirim') || lower.includes('delivery') || lower.includes('pengiriman'))
    return '🚚 We ship from China to Indonesia in 7-14 days via air freight. Free consolidation—combine multiple orders into one shipment! Shipping starts at Rp 50K/kg.';

  if (lower.includes('quality') || lower.includes('garansi') || lower.includes('jaminan') || lower.includes('warranty'))
    return '✅ Every product goes through AI quality inspection before shipping. We offer damage warranty—replacement or refund if items arrive damaged.';

  if (lower.includes('pay') || lower.includes('bayar') || lower.includes('pembayaran'))
    return '💳 We accept bank transfer, virtual account, and digital wallets through Xendit. Payment is secured with escrow—your money is safe until delivery.';

  if (lower.includes('help') || lower.includes('bantu') || lower.includes('tolong') || lower.includes('cara'))
    return '👋 I can help you:\n• 🔗 Paste a product link → I\'ll find it on 1688 with prices\n• 🔍 Search for products by keyword\n• 📦 Track your orders\n• 💰 Estimate shipping costs\n\nWhat would you like help with?';

  return '👋 Hi! I\'m ArbiBot, your AI shopping assistant. I can help you:\n\n🔗 **Paste a product link** — I\'ll find the same item from Chinese factories\n🔍 **Search products** — Tell me what you\'re looking for\n💰 **Compare prices** — See how much you save vs. local marketplaces\n\nHow can I help you today?';
}
