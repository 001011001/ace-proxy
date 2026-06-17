import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LocalLlmService } from '../llm/LocalLlmService';
import type { ChatResult as LlmChatResult } from '../llm/LocalLlmService';
import { ChatLogService } from './ChatLogService';
import { ProductService } from '../product/ProductService';
import { CartService } from '../cart/CartService';

/**
 * Public ChatResult — returned to the frontend.
 */
export interface ChatResult {
  reply: string;
  intent?: string;
  products?: any[];
  actions?: { type: string; label: string; productId?: string; }[];
  sessionId: string;
  toolUsed?: string;
}

/**
 * ChatService - AI Steward Core Engine (千问式电商)
 *
 * Supports two backends:
 * 1. **Ollama** (HTTP) — used when OLLAMA_URL env var is set (for power users)
 * 2. **LocalLlmService** (node-llama-cpp in-process) — used when no OLLAMA_URL
 *
 * Response format from Ollama/Qwen3:
 * {
 *   message: {
 *     role: 'assistant',
 *     content: '',
 *     thinking: '...',
 *     tool_calls: [{ id: 'call_xxx', function: { name, arguments } }]
 *   },
 *   done: true,
 *   done_reason: 'stop'
 * }
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly OLLAMA_URL = process.env.OLLAMA_URL || '';
  private readonly MODEL = process.env.OLLAMA_MODEL || 'qwen3:4b';

  constructor(
    private readonly prisma: PrismaService,
    private readonly localLlm: LocalLlmService,
    private readonly chatLogService: ChatLogService,
    private readonly productService: ProductService,
    private readonly cartService: CartService,
  ) {}

  /**
   * Core: AI Steward intelligent conversation endpoint (千问式电商)
   */
  async stewardChat(
    userId: string,
    message: string,
    conversationHistory: Array<{ role: string; content?: string; tool_calls?: any[]; name?: string }> = [],
    products: any[] | null = null,
    sessionId?: string,
  ): Promise<ChatResult> {
    const sid = sessionId || this.generateUUID();

    this.logger.log(`[Steward AI] User ${userId} (session ${sid}): ${message}`);

    // 1. Extract intent and log user message (async but don't block)
    const intent = this.extractIntent(message);
    this.chatLogService
      .log({ userId, sessionId: sid, role: 'user', content: message, intent })
      .catch(() => {});

    // 2. Build System Prompt (brand identity + rules + ACTION format)
    const systemPrompt = await this.buildSystemPrompt(products);

    // 3. Define tool functions available to the AI
    const tools = this.getToolDefinitions();

    // 4. Build message history
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((m) => ({ role: m.role, content: m.content || '' })),
      { role: 'user', content: message },
    ];

    // 5. Call LLM (Ollama or local)
    try {
      const aiResponse = await this.callLlm(messages, tools);
      if (!aiResponse) {
        return this.fallbackReply(sid, intent);
      }

      let replyContent = aiResponse.content;
      const toolCalls = aiResponse.toolCalls;

      // 5a. If AI wants to use a native tool function → execute it
      if (toolCalls && toolCalls.length > 0) {
        const firstCall = toolCalls[0];
        this.logger.log(`[Steward AI] Tool requested: ${firstCall.function.name}`);

        const toolResult = await this.executeToolCall(firstCall);

        // Feed result back to AI so it can formulate a natural-language answer
        const followUpMessages: any[] = [
          ...messages,
          {
            role: 'assistant',
            content: replyContent || '',
            tool_calls: toolCalls,
          },
          {
            role: 'tool',
            content: JSON.stringify(toolResult),
            name: firstCall.function.name,
          },
        ];
        const finalResponse = await this.callLlm(followUpMessages, []);

        replyContent = finalResponse?.content || 'I found some products for you!';

        // After tool execution, still parse for ACTION tags
        const result = await this.processActionReply(
          replyContent, userId, sid, intent,
          firstCall.function.name,
        );

        this.chatLogService
          .log({ userId, sessionId: sid, role: 'assistant', content: result.reply, intent })
          .catch(() => {});
        return result;
      }

      // 5b. Normal text reply — parse for [ACTION:...] tags
      const result = await this.processActionReply(replyContent, userId, sid, intent);

      // 6. Log assistant response (async, don't block)
      this.chatLogService
        .log({ userId, sessionId: sid, role: 'assistant', content: result.reply, intent })
        .catch(() => {});

      return result;
    } catch (error) {
      this.logger.error(`[Steward AI] LLM error: ${error}`);
      return this.fallbackReply(sid, intent);
    }
  }

  /**
   * Parse [ACTION:...] tags from AI response and execute the action.
   */
  private async processActionReply(
    replyContent: string,
    userId: string,
    sessionId: string,
    intent: string,
    toolUsed?: string,
  ): Promise<ChatResult> {
    const action = this.parseAction(replyContent);

    let finalReply = replyContent;
    let resultProducts: any[] | undefined;
    let resultActions: any[] | undefined;

    if (action) {
      // Strip ACTION tag from visible content
      finalReply = replyContent
        .replace(/\[ACTION:(\w+)\](.*?)\[\/ACTION\]/gs, '')
        .trim();

      this.logger.log(`[Steward AI] Action detected: ${action.action}`);

      try {
        switch (action.action) {
          case 'search': {
            const keywords = action.params.keywords || '';
            resultProducts = await this.searchProducts(keywords);
            if (resultProducts && resultProducts.length > 0) {
              const productList = resultProducts
                .slice(0, 3)
                .map(
                  (p) =>
                    `- ${p.name} (${p.category || 'General'}): Rp ${Number(p.priceIdr || 0).toLocaleString('id-ID')}`,
                )
                .join('\n');
              if (!finalReply) {
                finalReply = `Here are some products I found for "${keywords}":\n\n${productList}\n\nWould you like to add any of these to your cart?`;
              } else {
                finalReply = finalReply + '\n\n🔍 Search results:\n' + productList;
              }
              resultActions = resultProducts.map((p) => ({
                type: 'add_to_cart',
                label: `Add ${p.name} to cart`,
                productId: p.id,
              }));
            } else {
              finalReply = `I couldn't find any products matching "${keywords}". Try a different search?`;
            }
            break;
          }

          case 'add_to_cart': {
            try {
              await this.cartService.addToCart(
                userId,
                action.params.productId,
                action.params.quantity || 1,
              );
              finalReply = finalReply || 'Added to your cart! Ready to checkout when you are.';
              resultActions = [{ type: 'checkout', label: 'Proceed to Checkout' }];
            } catch (e: any) {
              finalReply = finalReply || `Sorry, I couldn't add that to your cart: ${e.message}`;
            }
            break;
          }

          case 'checkout': {
            finalReply =
              'Ready to checkout! Please review your cart and confirm your shipping details. Head to the checkout page when you\'re ready!';
            resultActions = [
              { type: 'checkout', label: 'Proceed to Checkout' },
              { type: 'view_cart', label: 'View Cart' },
            ];
            break;
          }

          case 'order_status': {
            finalReply =
              'To check your order status, visit your orders page or tell me your order ID and I can look it up for you.';
            break;
          }

          default:
            this.logger.warn(`[Steward AI] Unknown action: ${action.action}`);
        }
      } catch (actionError: any) {
        this.logger.warn(`[Steward AI] Action execution error: ${actionError.message}`);
        // Don't let action errors break the conversation
      }
    }

    return {
      reply: finalReply || "I'm here to help! Try asking about products or prices.",
      intent,
      products: resultProducts,
      actions: resultActions,
      sessionId,
      toolUsed: toolUsed || undefined,
    };
  }

  /**
   * Parse [ACTION:name]params[/ACTION] tags from AI response.
   */
  private parseAction(text: string): { action: string; params: any } | null {
    const match = text.match(/\[ACTION:(\w+)\](.*?)\[\/ACTION\]/s);
    if (!match) return null;
    try {
      return { action: match[1], params: match[2] ? JSON.parse(match[2]) : {} };
    } catch {
      return { action: match[1], params: {} };
    }
  }

  /**
   * Extract user intent from message text.
   */
  private extractIntent(message: string): string {
    const lower = message.toLowerCase();
    if (/buy|order|purchase|checkout|下单|购买|买/.test(lower)) return 'buy';
    if (/search|find|looking for|recommend|推荐|找|搜/.test(lower)) return 'search';
    if (/cart|add.*cart|加入购物车|keranjang/.test(lower)) return 'add_to_cart';
    if (/where.*order|status|track|delivery|在哪|到哪|追踪/.test(lower)) return 'order_status';
    if (/translate|翻译|terjemah/.test(lower)) return 'translate';
    return 'qa';
  }

  /**
   * Search products in AceProduct catalog via keyword.
   */
  private async searchProducts(keywords: string): Promise<any[]> {
    try {
      const result = await this.productService.listProducts({
        search: keywords,
        limit: 5,
      });
      return result.items || [];
    } catch (e: any) {
      this.logger.warn(`[Steward AI] Product search error: ${e.message}`);
      return [];
    }
  }

  /**
   * Build AceProxy-specific System Prompt (enhanced with ACTION format).
   */
  private async buildSystemPrompt(productsOverride: any[] | null): Promise<string> {
    let productContext = '';

    if (productsOverride && productsOverride.length > 0) {
      productContext = productsOverride
        .map(
          (p) =>
            `- ${p.name} (${p.category}): Rp ${(p.price || p.localPriceIdr)?.toLocaleString('id-ID')}`,
        )
        .join('\n');
    } else {
      try {
        const dbProducts = await this.prisma.aceHeroProduct.findMany({
          where: { status: 'ACTIVE' },
          orderBy: { arbitrageGapPct: 'desc' },
        });
        productContext = dbProducts
          .map(
            (p) =>
              `- ${p.name} (${p.category}): Rp ${Number(p.localPriceIdr || 0).toLocaleString('id-ID')}`,
          )
          .join('\n');
      } catch (e) {
        productContext = '- Product data loading...';
      }
    }

    return (
      this.baseBrandPrompt(productContext) +
      '\n\n' +
      this.getActionFormatPrompt()
    );
  }

  private baseBrandPrompt(productContext: string): string {
    return `You are the AI Shopping Assistant for AceProxy, a premium cross-border sourcing platform connecting global manufacturers to customers in Indonesia.

## WHO YOU ARE
- Name: AceProxy Assistant
- Tone: Friendly, helpful, enthusiastic but professional
- Language: English by default. Match the user's language (Bahasa Indonesia / Chinese).
- You are a shopping companion, not a robot. Be conversational!

## WHAT IS ACEPROXY
- Premium cross-border marketplace: factory-direct products shipped to Jakarta
- Every item is AI-inspected (VisionQC), vacuum-packed, tracked end-to-end
- Prices are 30-60% below local retail because we cut out middlemen

## ABSOLUTE RULES — NEVER VIOLATE THESE
❌ NEVER mention 1688, Taobao, Alibaba, Shopee, Tokopedia, Lazada, or any sourcing platform
❌ NEVER name specific factories, suppliers, or manufacturers by their real names
❌ NEVER promise refunds or returns — items are purchased per-customer
❌ NEVER disclose cost price, profit margins, or supplier details
❌ NEVER suggest buying from other platforms

## WHAT TO SAY WHEN ASKED
→ Returns/Refunds: "Items are bought specifically for you, so returns aren't possible. But our Resale Hub lets you resell easily and earn Ace Credits!"
→ Payment: "Secure checkout via Xendit & WorldFirst. GoPay, OVO, DANA, BCA, Mandiri, BNI all accepted."
→ Shipping: "7-10 business days to Jakarta with full tracking from factory to door."
→ Quality: "Every item passes VisionQC 2.0 AI inspection — color, stitching, specs all verified."
→ Why cheaper: "We source directly from premium factories, no middlemen markup!"

## CURRENT PRODUCT CATALOG (use these for recommendations):
${productContext}

## HOW TO RECOMMEND
- Recommend up to 3 relevant products matching the user's needs
- Always include: product name, price in IDR, and WHY it fits
- Use emojis: 👗 fashion, 🏠 home, ⌚ electronics, 🧳 travel, 🎁 gifts
- If user mentions budget, recommend within that range
- End suggestions with "Want details? Check it out on our homepage!"`;
  }

  private getActionFormatPrompt(): string {
    return `You can help users with the following actions. When the user expresses an intent, you MUST respond with a JSON action block:

For product search: [ACTION:search]{"keywords":"..."}[/ACTION]
For adding to cart: [ACTION:add_to_cart]{"productId":"...","quantity":1}[/ACTION]  
For checkout: [ACTION:checkout][/ACTION]
For order status: [ACTION:order_status][/ACTION]
For general Q&A: just respond normally without action tags.

IMPORTANT: When a user wants to buy something, first use [ACTION:search] to find products, then present them naturally, then guide them to add to cart and checkout.`;
  }

  /**
   * Tool definitions — capabilities exposed to the AI
   */
  private getToolDefinitions() {
    return [
      {
        type: 'function' as const,
        function: {
          name: 'searchProducts',
          description:
            'Search the AceProxy product catalog by keyword and/or category. Returns matching products with prices.',
          parameters: {
            type: 'object' as const,
            properties: {
              keyword: {
                type: 'string',
                description: 'Search term e.g. "dress", "hijab", "gift", "prayer mat"',
              },
              category: {
                type: 'string',
                description: 'Product category: Fashion, Home, Electronics, Travel, Gifts',
              },
              maxResults: { type: 'number', description: 'Max results to return (default 5)' },
            },
            required: ['keyword'],
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'searchByPrice',
          description: 'Find AceProxy products within a price range (Indonesian Rupiah).',
          parameters: {
            type: 'object' as const,
            properties: {
              minPrice: { type: 'number', description: 'Minimum price in IDR' },
              maxPrice: { type: 'number', description: 'Maximum price in IDR' },
            },
            required: ['maxPrice'],
          },
        },
      },
    ];
  }

  /**
   * Execute a tool call from the AI — query real data
   */
  private async executeToolCall(toolCall: any): Promise<any> {
    const fn = toolCall.function;

    let params: any = {};
    try {
      params = typeof fn.arguments === 'string' ? JSON.parse(fn.arguments) : fn.arguments || {};
    } catch (e) {
      this.logger.warn(`[Steward AI] Failed to parse tool arguments: ${e}`);
      params = {};
    }

    this.logger.log(`[Steward AI] Executing: ${fn.name}(${JSON.stringify(params)})`);

    switch (fn.name) {
      case 'searchProducts': {
        const whereClause: any = { status: 'ACTIVE' };
        if (params.category && params.category !== 'ALL') {
          whereClause.category = params.category;
        }

        const rawProducts = await this.prisma.aceHeroProduct.findMany({
          where: whereClause,
          take: params.maxResults || 5,
          orderBy: { arbitrageGapPct: 'desc' },
        });

        let results = rawProducts;
        if (params.keyword) {
          const kw = params.keyword.toLowerCase();
          results = rawProducts.filter(
            (p) =>
              p.name.toLowerCase().includes(kw) ||
              (p.category || '').toLowerCase().includes(kw),
          );
        }

        return results.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category || 'General',
          price: p.localPriceIdr || 0,
          formattedPrice: `Rp ${(p.localPriceIdr || 0).toLocaleString('id-ID')}`,
          savings: p.arbitrageGapPct
            ? `${Math.round(Number(p.arbitrageGapPct) * 100)}% off`
            : null,
          rating: null,
        }));
      }

      case 'searchByPrice': {
        const priceResults = await this.prisma.aceHeroProduct.findMany({
          where: {
            status: 'ACTIVE',
            localPriceIdr: {
              gte: params.minPrice || 0,
              lte: params.maxPrice || 999999999,
            },
          },
          orderBy: { localPriceIdr: 'asc' },
          take: 8,
        });
        return priceResults.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.localPriceIdr,
          formattedPrice: `Rp ${Number(p.localPriceIdr || 0).toLocaleString('id-ID')}`,
        }));
      }

      default:
        return { error: `Unknown tool: ${fn.name}` };
    }
  }

  /**
   * Call LLM — dispatches to Ollama (if OLLAMA_URL is set) or LocalLlmService.
   */
  private async callLlm(
    messages: Array<{ role: string; content?: string; tool_calls?: any[]; name?: string }>,
    tools: any[],
  ): Promise<{ content: string; toolCalls: any[] } | null> {
    // Prefer Ollama if OLLAMA_URL is explicitly configured (backward compat)
    if (this.OLLAMA_URL) {
      return this.callOllama(messages, tools);
    }

    // Use in-process LocalLlmService
    return this.callLocalLlm(messages, tools);
  }

  /**
   * Call Ollama HTTP API (original implementation, kept for backward compat).
   */
  private async callOllama(
    messages: Array<{ role: string; content?: string; tool_calls?: any[]; name?: string }>,
    tools: any[],
  ): Promise<{ content: string; toolCalls: any[] }> {
    const body: any = {
      model: this.MODEL,
      messages,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_ctx: 4096,
      },
    };

    if (tools.length > 0) {
      body.tools = tools;
    }

    this.logger.debug(
      `[Steward AI] Calling Ollama (${this.MODEL}), messages: ${messages.length}, tools: ${tools.length}`,
    );

    const response = await fetch(`${this.OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const msg = data.message || {};

    return {
      content: msg.content || '',
      toolCalls: msg.tool_calls || [],
    };
  }

  /**
   * Call LocalLlmService (in-process inference via node-llama-cpp).
   */
  private async callLocalLlm(
    messages: Array<{ role: string; content?: string; tool_calls?: any[]; name?: string }>,
    tools: any[],
  ): Promise<{ content: string; toolCalls: any[] } | null> {
    if (!this.localLlm.isAvailable()) {
      const loaded = await this.localLlm.ensureLoaded();
      if (!loaded) {
        this.logger.warn('[Steward AI] Local LLM not available');
        return null;
      }
    }

    const systemMsg = messages.find((m) => m.role === 'system');
    const chatMessages = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant' | 'tool',
        content: m.content || '',
        toolCalls: m.tool_calls,
        name: m.name,
      }));

    const result: LlmChatResult | null = await this.localLlm.chat(chatMessages, {
      systemPrompt: systemMsg?.content,
      temperature: 0.7,
      maxTokens: 256,
      tools: tools.length > 0 ? tools : undefined,
    });

    if (!result) return null;

    return {
      content: result.content,
      toolCalls: result.toolCalls,
    };
  }

  /**
   * Fallback reply when no LLM backend is available.
   */
  private fallbackReply(sessionId: string, intent?: string): ChatResult {
    const reply =
      'Sorry, my AI brain is taking a quick break. Please try again or contact us at hello@aceproxy.id';

    this.chatLogService
      .log({ sessionId, role: 'assistant', content: reply, intent })
      .catch(() => {});

    return {
      reply,
      intent,
      sessionId,
    };
  }

  /* ─── Legacy compatibility ─── */

  async handleUserMessage(orderId: string, userId: string, content: string) {
    this.logger.log(`[Steward] Legacy chat for order ${orderId}: ${content}`);
    return this.stewardChat(userId, content);
  }

  async handleSupplierReply(orderId: string, supplierContent: string) {
    this.logger.log(`[Steward] Supplier replied for order ${orderId}`);
    return { translated: supplierContent, status: 'RECEIVED' };
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
