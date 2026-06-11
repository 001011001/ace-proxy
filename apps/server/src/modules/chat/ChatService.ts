import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * ChatService - AI Steward Core Engine (Ollama Local Model)
 * Integrated with Qwen3 4B — native Function Calling / Tool Use support.
 *
 * Response format from Ollama/Qwen3:
 * {
 *   message: {
 *     role: 'assistant',
 *     content: '',           // may be empty when using tools/thinking
 *     thinking: '...',        // internal reasoning (IGNORE this)
 *     tool_calls: [{          // function calls the AI wants to execute
 *       id: 'call_xxx',
 *       function: { name, arguments }
 *     }]
 *   },
 *   done: true,
 *   done_reason: 'stop'
 * }
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
  private readonly MODEL = process.env.OLLAMA_MODEL || 'qwen3:4b';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Core: AI Steward intelligent conversation endpoint
   */
  async stewardChat(
    userId: string,
    message: string,
    conversationHistory: Array<{ role: string; content?: string; tool_calls?: any[]; name?: string }> = [],
    products: any[] | null = null,
  ) {
    this.logger.log(`[Steward AI] User ${userId}: ${message}`);

    // 1. Build System Prompt (brand identity + rules)
    const systemPrompt = await this.buildSystemPrompt(products);

    // 2. Define tool functions available to the AI
    const tools = this.getToolDefinitions();

    // 3. Build message history
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((m) => ({ role: m.role, content: m.content || '' })),
      { role: 'user', content: message },
    ];

    // 4. Call Ollama
    try {
      const aiResponse = await this.callOllama(messages, tools);
      const replyContent = aiResponse.content;
      const toolCalls = aiResponse.tool_calls;

      // 5a. If AI wants to use a tool function → execute it
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
        const finalResponse = await this.callOllama(followUpMessages, []);

        return {
          reply: finalResponse.content || 'I found some products for you!',
          toolUsed: firstCall.function.name,
          toolData: toolResult,
        };
      }

      // 5b. Normal text reply (no tools needed)
      return {
        reply: replyContent || 'I\'m here to help! Try asking about products or prices.',
        toolUsed: null,
      };
    } catch (error) {
      this.logger.error(`[Steward AI] Ollama error: ${error}`);
      return {
        reply: 'Sorry, my AI brain is taking a quick break. Please try again or chat with us on WhatsApp! 💬',
        toolUsed: null,
      };
    }
  }

  /**
   * Build AceProxy-specific System Prompt
   */
  private async buildSystemPrompt(productsOverride: any[] | null): Promise<string> {
    let productContext = '';

    if (productsOverride && productsOverride.length > 0) {
      // Use injected product data
      productContext = productsOverride
        .map((p) => `- ${p.name} (${p.category}): Rp ${(p.price || p.localPriceIdr)?.toLocaleString('id-ID')}`)
        .join('\n');
    } else {
      // Query database for active products
      try {
        const dbProducts = await this.prisma.aceHeroProduct.findMany({
          where: { status: 'ACTIVE' },
          orderBy: { arbitrageGapPct: 'desc' },
        });
        productContext = dbProducts
          .map((p) => `- ${p.name} (${p.category}): Rp ${Number(p.localPriceIdr || 0).toLocaleString('id-ID')}`)
          .join('\n');
      } catch (e) {
        productContext = '- Product data loading...';
      }
    }

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

  /**
   * Tool definitions — capabilities exposed to the AI
   */
  private getToolDefinitions() {
    return [
      {
        type: 'function',
        function: {
          name: 'searchProducts',
          description:
            'Search the AceProxy product catalog by keyword and/or category. Returns matching products with prices.',
          parameters: {
            type: 'object',
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
        type: 'function',
        function: {
          name: 'searchByPrice',
          description: 'Find AceProxy products within a price range (Indonesian Rupiah).',
          parameters: {
            type: 'object',
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

    // Parse arguments (may be stringified JSON or already object)
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

        // Apply keyword filter in memory (Prisma SQLite doesn't support ILIKE)
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
          savings: p.arbitrageGapPct ? `${Math.round(Number(p.arbitrageGapPct) * 100)}% off` : null,
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
   * Call Ollama API and parse Qwen3 response format
   */
  private async callOllama(
    messages: Array<{ role: string; content?: string; tool_calls?: any[]; name?: string }>,
    tools: any[],
  ): Promise<{ content: string; tool_calls: any[] }> {
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

    this.logger.debug(`[Steward AI] Calling Ollama (${this.MODEL}), messages: ${messages.length}, tools: ${tools.length}`);

    const response = await fetch(`${this.OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000), // 60s timeout
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const msg = data.message || {};

    // Qwen3 response format:
    // msg.content = final text (empty if only tool calls were made)
    // msg.thinking = internal reasoning (ignore)
    // msg.tool_calls = array of function calls

    return {
      content: msg.content || '', // may be empty when tool_calls exist
      tool_calls: msg.tool_calls || [],
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
}
