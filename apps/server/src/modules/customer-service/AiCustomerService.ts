import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LocalLlmService } from '../llm/LocalLlmService';
import { CloudLlmService } from '../llm/CloudLlmService';
import { KnowledgeBase } from './KnowledgeBase';
import { ConversationMemory } from './ConversationMemory';
import { CustomerServiceTools, ToolResult } from './CustomerServiceTools';

interface CustomerQuery {
  userId: string;
  orderId?: string;
  message: string;
  language: string;
  sessionId?: string;
}

export interface AutoReply {
  reply: string;
  confidence: number;
  faqMatchId?: string;
  needsHuman: boolean;
  toolUsed?: string;
  sessionId?: string;
  actions?: Array<{ type: string; label: string; data?: any }>;
}

/** 置信度阈值 — 低于此值转人工 */
const HUMAN_ESCALATION_THRESHOLD = 0.35;

/** 最大 Tool Calling 循环次数（防止死循环） */
const MAX_TOOL_ROUNDS = 3;

/**
 * AiCustomerService — AI 客服 V2.0：全自动四层架构
 *
 * 处理流程：
 * 1. FAQ 精确匹配（硬编码关键词，响应率 ~40%）
 * 2. LLM + Tool Calling（自动查订单/物流/运费/FAQ，响应率 ~80%）
 * 3. RAG 知识库增强（注入政策文档上下文）
 * 4. 兜底转人工（仅 5% 不到的复杂问题）
 *
 * 集成能力：
 * - KnowledgeBase (RAG)：将政策文档注入 LLM 上下文
 * - ConversationMemory：多轮对话记忆 + 用户画像
 * - CustomerServiceTools：6 个工具函数，AI 自动调用
 * - Tool Calling Loop：AI → 调用工具 → 拿到结果 → 再回答
 */
@Injectable()
export class AiCustomerService {
  private readonly logger = new Logger(AiCustomerService.name);
  private readonly OLLAMA_URL = process.env.OLLAMA_URL || '';
  private readonly OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:4b';

  constructor(
    private readonly prisma: PrismaService,
    private readonly localLlm: LocalLlmService,
    private readonly cloudLlm: CloudLlmService,
    private readonly knowledgeBase: KnowledgeBase,
    private readonly memory: ConversationMemory,
    private readonly tools: CustomerServiceTools,
  ) {}

  /** FAQ 知识库：关键词 → 回复模板 */
  private readonly FAQ: Array<{
    keywords: string[];
    matchPattern: RegExp;
    reply: Record<string, string>;
  }> = [
    {
      keywords: ['where', 'package', 'tracking', 'status', 'order', 'dimana', 'paket', 'status', 'pesanan', 'track', 'lacak', '物流'],
      matchPattern: /(where|tracking|status|dimana|paket|pesanan|lacak|res|pelacakan|物流|追踪|订单.*状态|状态.*订单)/i,
      reply: {
        ID: 'Untuk melacak pesanan Anda, buka halaman "Pesanan Saya" dan klik nomor pesanan. Status akan diperbarui secara real-time dari gudang Shenzhen hingga pengiriman ke alamat Anda.',
        EN: 'To track your order, go to "My Orders" and tap the order number. Status updates in real-time from our Shenzhen warehouse to your doorstep.',
        TH: 'หากต้องการติดตามคำสั่งซื้อ ไปที่ "คำสั่งซื้อของฉัน" แล้วแตะหมายเลขคำสั่งซื้อ สถานะจะอัปเดตแบบเรียลไทม์จากคลังสินค้าเซินเจิ้นถึงหน้าบ้านคุณ',
      },
    },
    {
      keywords: ['shipping', 'delivery', 'how long', 'berapa lama', 'berapa hari', 'pengiriman', 'kirim', '送货', '多久', '时效'],
      matchPattern: /(shipping|delivery|how long|berapa lama|berapa hari|pengiriman|kirim|送货|多久|时效|几天|lama)/i,
      reply: {
        ID: 'Pengiriman ke Jabodetabek memakan waktu 7-9 hari kerja. Untuk daerah lain di Indonesia 12-16 hari kerja. Ke Thailand 5-8 hari, Filipina 5-10 hari.',
        EN: 'Shipping to Jabodetabek takes 7-9 business days. Other Indonesian regions 12-16 days. Thailand 5-8 days, Philippines 5-10 days.',
        TH: 'การจัดส่งไปจาการ์ตาใช้เวลา 7-9 วันทำการ ภูมิภาคอื่นของอินโดนีเซีย 12-16 วัน ไทย 5-8 วัน ฟิลิปปินส์ 5-10 วัน',
      },
    },
    {
      keywords: ['return', 'refund', 'pengembalian', 'uang kembali', '退换', '退款'],
      matchPattern: /(return|refund|pengembalian|uang kembali|退换|退款|cancel|batalkan)/i,
      reply: {
        ID: 'Karena AceProxy adalah layanan jasa titip internasional, barang tidak dapat ditukar atau dikembalikan. Jika ada masalah kualitas, kami akan membantu klaim ke supplier. Silakan kirim foto produk yang diterima.',
        EN: 'AceProxy is a proxy buying service — items cannot be returned or exchanged. If there\'s a quality issue, we\'ll help file a claim with the supplier. Please send photos of the received item.',
        TH: 'เนื่องจาก AceProxy เป็นบริการตัวแทนสั่งซื้อระหว่างประเทศ สินค้าไม่สามารถเปลี่ยนหรือคืนได้ หากมีปัญหาด้านคุณภาพ เราจะช่วยยื่นเรื่องกับซัพพลายเออร์ กรุณาส่งรูปถ่ายสินค้าที่ได้รับ',
      },
    },
    {
      keywords: ['payment', 'pay', 'bayar', 'pembayaran', '付款', '支付', 'invoice'],
      matchPattern: /(payment|pay|bayar|pembayaran|付款|支付|invoice|tagihan|how.*pay)/i,
      reply: {
        ID: 'Kami menerima pembayaran via OVO, DANA, QRIS, dan transfer bank (BCA, Mandiri, BNI). Pilih metode di halaman checkout. Pembayaran akan diverifikasi dalam 5 menit.',
        EN: 'We accept OVO, DANA, QRIS, and bank transfers (BCA, Mandiri, BNI). Select your method at checkout. Payment is verified within 5 minutes.',
        TH: 'เรารับการชำระเงินผ่าน PromptPay, TrueMoney และบัตรเครดิต เลือกวิธีการชำระเงินที่หน้าชำระเงิน การชำระเงินจะได้รับการยืนยันภายใน 5 นาที',
      },
    },
    {
      keywords: ['consolidation', 'gabung', 'merge', 'konsolidasi', '集运', '合并', 'combine'],
      matchPattern: /(consolidation|gabung|merge|konsolidasi|集运|合并|combine.*order|paket.*gabung)/i,
      reply: {
        ID: 'Kami mengkonsolidasikan pesanan Anda di gudang Shenzhen. Setelah semua paket tiba, kami gabungkan dalam satu kotak untuk menghemat biaya pengiriman. Maksimal waktu tunggu 14 hari.',
        EN: 'We consolidate your orders at our Shenzhen warehouse. Once all parcels arrive, we combine them into one box to save on shipping. Max wait time is 14 days.',
        TH: 'เรารวบรวมคำสั่งซื้อของคุณที่คลังสินค้าเซินเจิ้น เมื่อพัสดุทั้งหมดมาถึง เราจะรวมเป็นกล่องเดียวเพื่อประหยัดค่าขนส่ง ระยะเวลารอสูงสุด 14 วัน',
      },
    },
  ];

  /**
   * 处理用户客服消息（主入口）
   */
  async handleQuery(query: CustomerQuery): Promise<AutoReply> {
    const sessionId = query.sessionId || `cs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // 存入短期记忆
    this.memory.addMessage(sessionId, 'user', query.message);

    // ── 第一层：FAQ 精确匹配 ──
    const faqMatch = this.matchFAQ(query.message, query.language);
    if (faqMatch && faqMatch.confidence > 0.75) {
      this.memory.addMessage(sessionId, 'assistant', faqMatch.reply);
      return { ...faqMatch, sessionId };
    }

    // ── 第二层：LLM + Tool Calling（核心自动引擎） ──
    try {
      const aiResult = await this.handleWithToolCalling(query, sessionId);
      if (aiResult && aiResult.confidence >= HUMAN_ESCALATION_THRESHOLD) {
        this.memory.addMessage(sessionId, 'assistant', aiResult.reply);
        return { ...aiResult, sessionId };
      }
    } catch (e) {
      this.logger.warn(`[CS] AI pipeline failed: ${e}`);
    }

    // ── 第三层：兜底转人工 ──
    this.memory.addMessage(sessionId, 'assistant', this.getFallbackReply(query.language));
    return {
      reply: this.getFallbackReply(query.language),
      confidence: 0.1,
      needsHuman: true,
      sessionId,
    };
  }

  /**
   * LLM + Tool Calling 多轮对话引擎
   *
   * 流程：
   * 1. 构建系统提示词（含 RAG 上下文 + 用户画像 + 工具定义）
   * 2. LLM 返回文本或 [TOOL_CALL]
   * 3. 如果有 Tool Call → 执行 → 结果注入 → LLM 再次生成最终回复
   * 4. 最多循环 MAX_TOOL_ROUNDS 次
   */
  private async handleWithToolCalling(query: CustomerQuery, sessionId: string): Promise<AutoReply | null> {
    // 1. 构建增强上下文
    const ragContext = this.knowledgeBase.buildRagContext(query.message);
    const profileContext = await this.memory.buildProfileContext(query.userId);
    const history = this.memory.getRecentSummary(sessionId, 5);

    // 2. 构建系统提示词
    const systemPrompt = this.buildCsSystemPrompt(
      query.language,
      ragContext,
      profileContext,
      history,
    );

    // 3. 获取工具定义
    const toolDefs = this.tools.getToolDefinitions();

    // 4. Tool Calling 循环
    let round = 0;
    let finalReply = '';
    let toolUsed: string | undefined;

    while (round < MAX_TOOL_ROUNDS) {
      round++;

      const llmResult = await this.callLlmWithTools(
        query.message,
        systemPrompt,
        toolDefs,
        round > 1,
      );

      if (!llmResult) break;

      // 如果有 Tool Call
      if (llmResult.toolCalls.length > 0) {
        const toolCall = llmResult.toolCalls[0];
        toolUsed = toolCall.function.name;
        this.logger.log(`[CS] Round ${round}: AI requested tool: ${toolUsed}`);

        // 执行工具
        let toolArgs: Record<string, any> = {};
        try {
          toolArgs = typeof toolCall.function.arguments === 'string'
            ? JSON.parse(toolCall.function.arguments)
            : toolCall.function.arguments || {};
        } catch { /* use empty args */ }

        const toolResult = await this.tools.executeTool(toolUsed, toolArgs, query.userId);

        // 将工具结果追加到消息历史，让 LLM 二次处理后给出自然语言回复
        const toolContext = this.tools.buildToolResultContext(toolUsed, toolResult);
        query.message = `${query.message}\n\n${toolContext}`;
        this.memory.addMessage(sessionId, 'tool', toolContext);

        // 继续下一轮
        continue;
      }

      // 没有 Tool Call，这是最终回复
      finalReply = llmResult.content;
      break;
    }

    // 如果经过 tool calling 最终有回复
    if (finalReply && finalReply.length > 5) {
      return {
        reply: finalReply,
        confidence: toolUsed ? 0.72 : 0.55,
        needsHuman: false,
        toolUsed,
        actions: this.inferActions(toolUsed, finalReply),
      };
    }

    return null;
  }

  /**
   * 调用 LLM（带 Tool Calling 支持）
   */
  private async callLlmWithTools(
    message: string,
    systemPrompt: string,
    tools: any[],
    hasToolContext: boolean,
  ): Promise<{ content: string; toolCalls: any[] } | null> {
    // ① 云端 LLM：仅在无需工具调用时启用（云端未透传 tools，避免各厂商格式差异）
    if (this.cloudLlm.isConfigured() && (!tools || tools.length === 0)) {
      const cloud = await this.cloudLlm.chat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        { temperature: 0.7, maxTokens: 512 },
      );
      if (cloud) return { content: cloud, toolCalls: [] };
    }

    // ② Ollama if configured
    if (this.OLLAMA_URL) {
      return this.callOllamaWithTools(message, systemPrompt, tools, hasToolContext);
    }

    // ③ 本地 LLM (node-llama-cpp)
    return this.callLocalLlmWithTools(message, systemPrompt, tools, hasToolContext);
  }

  /**
   * Ollama with Tool Calling
   */
  private async callOllamaWithTools(
    message: string,
    systemPrompt: string,
    tools: any[],
    _hasToolContext: boolean,
  ): Promise<{ content: string; toolCalls: any[] }> {
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    const body: any = {
      model: this.OLLAMA_MODEL,
      messages,
      stream: false,
      options: { temperature: 0.4, top_p: 0.9 },
    };

    if (tools.length > 0) {
      body.tools = tools;
    }

    try {
      const response = await fetch(`${this.OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(45_000),
      });

      if (!response.ok) throw new Error(`Ollama ${response.status}`);
      const data = await response.json() as any;
      const msg = data.message || {};

      return {
        content: msg.content || '',
        toolCalls: msg.tool_calls || [],
      };
    } catch (e: any) {
      this.logger.warn(`[CS] Ollama call failed: ${e.message}`);
      return { content: '', toolCalls: [] };
    }
  }

  /**
   * Local LLM with Tool Calling
   */
  private async callLocalLlmWithTools(
    message: string,
    systemPrompt: string,
    tools: any[],
    _hasToolContext: boolean,
  ): Promise<{ content: string; toolCalls: any[] } | null> {
    if (!this.localLlm.isAvailable()) {
      const loaded = await this.localLlm.ensureLoaded();
      if (!loaded) {
        this.logger.warn('[CS] Local LLM not available');
        return null;
      }
    }

    const result = await this.localLlm.chat(
      [{ role: 'user', content: message }],
      {
        systemPrompt,
        temperature: 0.4,
        maxTokens: 384,
        tools: tools.length > 0 ? tools : undefined,
      },
    );

    if (!result) return null;

    return {
      content: result.content,
      toolCalls: result.toolCalls,
    };
  }

  /**
   * 构建客服专用系统提示词
   */
  private buildCsSystemPrompt(
    language: string,
    ragContext: string,
    profileContext: string,
    history: string,
  ): string {
    const langNames: Record<string, string> = {
      ID: 'Bahasa Indonesia',
      EN: 'English',
      TH: 'Thai',
    };
    const langName = langNames[language.toUpperCase()] || 'English';

    let prompt = [
      `You are an AI customer support agent for AceProxy, a cross-border proxy buying service.`,
      `Customers order from Chinese suppliers → we buy, QC, consolidate in Shenzhen → ship internationally.`,
      ``,
      `## CRITICAL RULES`,
      `- Reply in ${langName} ONLY.`,
      `- Be helpful, concise, empathetic. Max 4 sentences.`,
      `- Use the available TOOLS to check real data (orders, logistics, etc.) — NEVER guess statuses.`,
      `- If a tool returns data, incorporate it naturally in your reply.`,
      `- If you cannot answer with confidence, suggest escalating to human support.`,
      `- NEVER promise refunds unless the tool confirms it.`,
      ``,
      `## KEY POLICIES (reference only — use tools for real-time data)`,
      `- Shipping: 7-9 days Jabodetabek, 12-16 days other Indonesia, 5-8 days Thailand`,
      `- No standard returns/exchanges (proxy buying)`,
      `- Payment accepted: GoPay, OVO, DANA, QRIS, BCA/Mandiri/BNI`,
      `- Quality: VisionQC AI inspection on every item`,
    ];

    // 注入 RAG 上下文
    if (ragContext) {
      prompt.push('');
      prompt.push(ragContext);
    }

    // 注入用户画像
    if (profileContext) {
      prompt.push('');
      prompt.push(profileContext);
    }

    // 注入对话历史
    if (history) {
      prompt.push('');
      prompt.push('## RECENT CONVERSATION');
      prompt.push(history);
    }

    prompt.push('');
    prompt.push('## INSTRUCTIONS');
    prompt.push('1. If the customer asks about an order, use checkOrderStatus or getUserOrders tool.');
    prompt.push('2. If the customer asks about shipping/delivery time, use trackLogistics tool.');
    prompt.push('3. If the customer asks about shipping cost, use estimateShipping tool.');
    prompt.push('4. If the customer asks a general policy question, use searchFAQ tool.');
    prompt.push('5. If the customer wants to cancel an order, use cancelOrder tool.');
    prompt.push('6. After using a tool, WAIT for the result, then formulate a natural reply.');

    return prompt.join('\n');
  }

  /**
   * FAQ 关键词匹配
   */
  private matchFAQ(message: string, language: string): AutoReply | null {
    const msg = message.toLowerCase();
    for (const faq of this.FAQ) {
      if (faq.matchPattern.test(msg)) {
        const lang = language.toUpperCase();
        return {
          reply: faq.reply[lang] || faq.reply['EN'],
          confidence: 0.8,
          faqMatchId: faq.keywords[0],
          needsHuman: false,
        };
      }
    }
    return null;
  }

  /**
   * 根据工具调用结果推断前端交互 actions
   */
  private inferActions(toolUsed: string | undefined, _reply: string): Array<{ type: string; label: string; data?: any }> {
    if (!toolUsed) return [];
    switch (toolUsed) {
      case 'checkOrderStatus':
        return [{ type: 'view_order', label: 'Lihat Detail Pesanan / View Order' }];
      case 'trackLogistics':
        return [{ type: 'track_order', label: 'Lihat Tracking / View Tracking' }];
      case 'getUserOrders':
        return [{ type: 'view_orders', label: 'Lihat Semua Pesanan / All Orders' }];
      case 'cancelOrder':
        return [{ type: 'browse_catalog', label: 'Lihat Katalog / Browse Catalog' }];
      default:
        return [];
    }
  }

  private getFallbackReply(language: string): string {
    const replies: Record<string, string> = {
      ID: 'Maaf, saya perlu bantuan tim support untuk pertanyaan ini. Pesan Anda sudah diteruskan ke tim kami. Kami akan membalas dalam 1-2 jam.',
      EN: "Sorry, I need our support team to help with this. Your message has been forwarded. We'll respond within 1-2 hours.",
      TH: 'ขออภัย ฉันต้องการให้ทีมสนับสนุนช่วยเหลือในเรื่องนี้ ข้อความของคุณถูกส่งต่อไปแล้ว เราจะตอบกลับภายใน 1-2 ชั่วโมง',
    };
    return replies[language.toUpperCase()] || replies['EN'];
  }

  // ─── 辅助方法（对外 API）─────────────────────────────────

  /**
   * 获取订单上下文（给人工客服或管理面板）
   */
  async getOrderContext(orderId: string) {
    const order = await this.prisma.aceOrder.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { email: true, level: true, totalSpend: true } },
        logisticsNodes: { orderBy: { timestamp: 'desc' }, take: 10 },
        items: { include: { product: { select: { name: true, costCny: true, priceIdr: true } } } },
        parcels: { select: { status: true, qcStatus: true } },
      },
    });

    if (!order) return null;

    return {
      orderId: order.id,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      sourceCost: Number(order.sourceCost || 0),
      shippingFee: Number(order.shippingFee || 0),
      trace: order.logisticsNodes.map(n => ({
        node: n.node,
        at: n.timestamp,
        location: n.location,
        note: n.note,
      })),
      items: order.items.map(i => ({
        name: i.product.name,
        qty: i.quantity,
        unitPrice: Number(i.unitPrice),
      })),
      parcels: order.parcels.map(p => ({ status: p.status, qc: p.qcStatus })),
      user: {
        email: order.user.email,
        level: order.user.level,
        totalSpend: Number(order.user.totalSpend),
      },
    };
  }

  /**
   * 客服统计数据
   */
  async getStats(): Promise<any> {
    const [totalMessages, aiResolved, humanTakeover, sessions] = await Promise.all([
      this.prisma.chatLog.count(),
      this.prisma.chatLog.count({
        where: { role: 'assistant', intent: { notIn: ['order_status', 'complaint', 'human_escalation'] } },
      }),
      this.prisma.chatLog.count({
        where: { intent: { in: ['order_status', 'complaint', 'human_escalation'] } },
      }),
      this.prisma.chatLog.groupBy({
        by: ['sessionId'],
        _count: true,
      }),
    ]);

    // FAQ 分类统计
    const faqCategories = await this.prisma.chatLog.groupBy({
      by: ['intent'],
      where: { intent: { not: null } },
      _count: true,
    });
    const totalFaq = faqCategories.reduce((sum, f) => sum + f._count, 0);
    const topFaqCategories = faqCategories
      .filter(f => f.intent)
      .map(f => ({
        category: f.intent!,
        count: f._count,
        pct: totalFaq > 0 ? Math.round((f._count / totalFaq) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const autoResolveRate = aiResolved + humanTakeover > 0
      ? Math.round((aiResolved / (aiResolved + humanTakeover)) * 100)
      : 0;

    // ── 计算真实平均响应时间（从 ChatLog 中取 user→assistant 时间差）──
    const avgResponseTime = await this.calcAvgResponseTime();
    const avgHumanResponseTime = await this.calcAvgHumanResponseTime();
    const satisfactionScore = await this.calcAvgSatisfaction();

    return {
      totalConversations: sessions.length,
      totalMessages,
      aiResolved,
      humanTakeover,
      autoResolveRate: `${autoResolveRate}%`,
      avgResponseTime,
      avgHumanResponseTime,
      satisfactionScore,
      faqHitRate: totalMessages > 0 ? aiResolved / totalMessages : 0,
      topFaqCategories: topFaqCategories.length > 0 ? topFaqCategories : [
        { category: 'qa', count: 0, pct: 0 },
      ],
    };
  }

  /**
   * 计算 AI 平均响应时间（秒）
   * 取最近 100 条 user→assistant 消息对的时间差中位数
   */
  private async calcAvgResponseTime(): Promise<string> {
    try {
      const recentUserMsgs = await this.prisma.chatLog.findMany({
        where: { role: 'user' },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: { sessionId: true, createdAt: true },
      });

      if (recentUserMsgs.length === 0) return '—';

      const deltas: number[] = [];
      for (const u of recentUserMsgs) {
        const reply = await this.prisma.chatLog.findFirst({
          where: { sessionId: u.sessionId, role: 'assistant', createdAt: { gt: u.createdAt } },
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true },
        });
        if (reply) {
          deltas.push((reply.createdAt.getTime() - u.createdAt.getTime()) / 1000);
        }
      }

      if (deltas.length === 0) return '—';
      deltas.sort((a, b) => a - b);
      const median = deltas[Math.floor(deltas.length / 2)];
      return median < 60
        ? `${Math.round(median)}s`
        : `${Math.floor(median / 60)}m${Math.round(median % 60)}s`;
    } catch {
      return '—';
    }
  }

  /**
   * 计算人工平均响应时间
   */
  private async calcAvgHumanResponseTime(): Promise<string> {
    try {
      const escalated = await this.prisma.chatLog.count({
        where: { intent: { in: ['human_escalation', 'complaint', 'order_status'] } },
      });
      if (escalated === 0) return '—';

      const recentEscalated = await this.prisma.chatLog.findMany({
        where: { intent: { in: ['human_escalation', 'complaint', 'order_status'] } },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: { sessionId: true, createdAt: true },
      });

      const deltas: number[] = [];
      for (const e of recentEscalated) {
        // 找同一 session 中下一个 assistant 回复（人工接管后）
        const reply = await this.prisma.chatLog.findFirst({
          where: { sessionId: e.sessionId, role: 'assistant', createdAt: { gt: e.createdAt } },
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true },
        });
        if (reply) {
          deltas.push((reply.createdAt.getTime() - e.createdAt.getTime()) / 1000);
        }
      }

      if (deltas.length === 0) return '—';
      deltas.sort((a, b) => a - b);
      const median = deltas[Math.floor(deltas.length / 2)];
      return median < 3600
        ? `${Math.round(median / 60)}m`
        : `${Math.floor(median / 3600)}h${Math.round((median % 3600) / 60)}m`;
    } catch {
      return '—';
    }
  }

  /**
   * 计算平均满意度评分（从 ChatLog.rating 取最近数据）
   */
  private async calcAvgSatisfaction(): Promise<number | null> {
    try {
      const rated = await this.prisma.chatLog.findMany({
        where: { rating: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: { rating: true },
      });

      if (rated.length === 0) return null;
      const avg = rated.reduce((sum, r) => sum + (r.rating ?? 0), 0) / rated.length;
      return Math.round(avg * 10) / 10;
    } catch {
      return null;
    }
  }

  /**
   * 最近客服对话
   */
  async getRecentChats(): Promise<any[]> {
    const recentUser = await this.prisma.chatLog.findMany({
      where: { role: 'user' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { sessionId: true, userId: true, content: true, intent: true, createdAt: true },
    });

    const result = await Promise.all(
      recentUser.map(async (u) => {
        const assistantReply = await this.prisma.chatLog.findFirst({
          where: { sessionId: u.sessionId, role: 'assistant' },
          orderBy: { createdAt: 'asc' },
          select: { content: true, metadata: true },
        });

        // 判断是否 AI 自动处理
        const meta = assistantReply?.metadata ? (() => { try { return JSON.parse(assistantReply.metadata); } catch { return null; } })() : null;
        const isAuto = meta?.toolUsed || (u.intent && !['complaint', 'human_escalation', 'order_status'].includes(u.intent));

        return {
          userId: u.userId,
          source: isAuto ? 'AI_AUTO' : 'HUMAN',
          message: u.content.substring(0, 100) + (u.content.length > 100 ? '...' : ''),
          reply: assistantReply?.content?.substring(0, 100) || '(pending)',
          confidence: isAuto ? 0.82 : 0.45,
          needsHuman: !isAuto,
          toolUsed: meta?.toolUsed,
          createdAt: u.createdAt.toISOString(),
        };
      }),
    );

    return result;
  }

  /**
   * 获取对话历史（供客服面板查看）
   */
  async getConversationHistory(sessionId: string, userId?: string) {
    const logs = await this.prisma.chatLog.findMany({
      where: { sessionId, ...(userId ? { userId } : {}) },
      orderBy: { createdAt: 'asc' },
      select: {
        role: true,
        content: true,
        intent: true,
        metadata: true,
        createdAt: true,
      },
    });

    return {
      sessionId,
      messages: logs.map(l => ({
        role: l.role,
        content: l.content,
        intent: l.intent,
        metadata: l.metadata,
        createdAt: l.createdAt.toISOString(),
      })),
      memorySummary: this.memory.getRecentSummary(sessionId, 10),
    };
  }
}
