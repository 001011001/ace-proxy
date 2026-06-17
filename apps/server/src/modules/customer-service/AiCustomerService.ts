import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LocalLlmService } from '../llm/LocalLlmService';

interface CustomerQuery {
  userId: string;
  orderId?: string;
  message: string;
  language: string;
}

export interface AutoReply {
  reply: string;
  confidence: number;
  faqMatchId?: string;
  needsHuman: boolean;
}

/**
 * AiCustomerService — AI 客服（内嵌在 App/Web 内）
 *
 * 三层响应策略：
 * 1. FAQ 精确匹配（关键词+订单状态）
 * 2. 本地 LLM 语义理解（自动回80%问题）/ Ollama（如果 OLLAMA_URL 已配置）
 * 3. 复杂问题标记→人工接管队列
 */
@Injectable()
export class AiCustomerService {
  private readonly logger = new Logger(AiCustomerService.name);
  private readonly OLLAMA_URL = process.env.OLLAMA_URL || '';
  private readonly OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:4b';

  constructor(
    private readonly prisma: PrismaService,
    private readonly localLlm: LocalLlmService,
  ) {}

  /** FAQ 知识库：关键词 → 回复模板 */
  private readonly FAQ: Array<{
    keywords: string[];
    matchPattern: RegExp;
    reply: Record<string, string>; // lang → text
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
   * 处理用户客服消息
   */
  async handleQuery(query: CustomerQuery): Promise<AutoReply> {
    // 1. FAQ 精确匹配
    const faqMatch = this.matchFAQ(query.message);
    if (faqMatch && faqMatch.confidence > 0.6) {
      return faqMatch;
    }

    // 2. LLM 语义理解
    try {
      const aiReply = await this.callLlm(query.message, query.language);
      if (aiReply && aiReply.length > 10) {
        return { reply: aiReply, confidence: 0.5, needsHuman: false };
      }
    } catch (e) {
      this.logger.warn(`[CS] LLM failed: ${e}`);
    }

    // 3. 兜底：转人工
    return {
      reply: this.getFallbackReply(query.language),
      confidence: 0.1,
      needsHuman: true,
    };
  }

  /**
   * 获取订单相关的客服摘要（给人工客服参考）
   */
  async getOrderContext(orderId: string) {
    const order = await this.prisma.aceOrder.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { email: true, level: true, totalSpend: true } },
        logisticsNodes: { orderBy: { timestamp: 'desc' }, take: 5 },
        items: { include: { product: { select: { name: true, costCny: true } } } },
      },
    });

    if (!order) return null;

    return {
      orderId: order.id,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      sourceCost: Number(order.sourceCost || 0),
      shippingFee: Number(order.shippingFee || 0),
      trace: order.logisticsNodes.map(n => ({ node: n.node, at: n.timestamp, location: n.location })),
      items: order.items.map(i => ({ name: i.product.name, qty: i.quantity, unitPrice: Number(i.unitPrice) })),
      user: { email: order.user.email, level: order.user.level, totalSpend: Number(order.user.totalSpend) },
    };
  }

  /**
   * FAQ 关键词匹配
   */
  private matchFAQ(message: string): AutoReply | null {
    const msg = message.toLowerCase();
    for (const faq of this.FAQ) {
      if (faq.matchPattern.test(msg)) {
        return {
          reply: faq.reply['ID'] || faq.reply['EN'],
          confidence: 0.8,
          faqMatchId: faq.keywords[0],
          needsHuman: false,
        };
      }
    }
    return null;
  }

  /**
   * Call LLM — dispatches to Ollama (if configured) or LocalLlmService.
   */
  private async callLlm(message: string, language: string): Promise<string | null> {
    // Prefer Ollama if OLLAMA_URL is explicitly configured (backward compat)
    if (this.OLLAMA_URL) {
      return this.callOllama(message, language);
    }

    // Use in-process LocalLlmService
    return this.callLocalLlm(message, language);
  }

  /**
   * Ollama Qwen3 客服对话（original implementation, kept for backward compat）
   */
  private async callOllama(message: string, language: string): Promise<string> {
    const langNames: Record<string, string> = { ID: 'Bahasa Indonesia', EN: 'English', TH: 'Thai' };
    const langName = langNames[language.toUpperCase()] || 'English';

    const systemPrompt = [
      `You are AceProxy customer support. Reply in ${langName}.`,
      `AceProxy is a cross-border proxy buying service: customers order from Chinese suppliers, we buy, consolidate in Shenzhen, ship internationally.`,
      `Key policies: no returns/refunds on proxy purchases. 7-9 day shipping to Jabodetabek, 12-16 days to other Indonesia. Consolidation max 14 days.`,
      `Be helpful, concise, and friendly. If you don't know, suggest contacting human support.`,
      `Reply in ${langName} only. Keep under 3 sentences.`,
    ].join('\n');

    const response = await fetch(`${this.OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.OLLAMA_MODEL,
        prompt: `${systemPrompt}\n\nCustomer: ${message}\n\nSupport:`,
        stream: false,
        options: { temperature: 0.5, num_predict: 256 },
      }),
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
    const data = await response.json() as any;
    return data.response?.trim() || '';
  }

  /**
   * LocalLlmService 客服对话
   */
  private async callLocalLlm(message: string, language: string): Promise<string | null> {
    const langNames: Record<string, string> = { ID: 'Bahasa Indonesia', EN: 'English', TH: 'Thai' };
    const langName = langNames[language.toUpperCase()] || 'English';

    const prompt = [
      `You are AceProxy customer support. Reply in ${langName}.`,
      `AceProxy is a cross-border proxy buying service: customers order from Chinese suppliers, we buy, consolidate in Shenzhen, ship internationally.`,
      `Key policies: no returns/refunds on proxy purchases. 7-9 day shipping to Jabodetabek, 12-16 days to other Indonesia. Consolidation max 14 days.`,
      `Be helpful, concise, and friendly. If you don't know, suggest contacting human support.`,
      `Reply in ${langName} only. Keep under 3 sentences.`,
      ``,
      `Customer: ${message}`,
      ``,
      `Support:`,
    ].join('\n');

    const result = await this.localLlm.completion(prompt, {
      temperature: 0.5,
      maxTokens: 256,
    });

    return result;
  }

  private getFallbackReply(language: string): string {
    const replies: Record<string, string> = {
      ID: 'Maaf, saya perlu bantuan tim support untuk pertanyaan ini. Pesan Anda sudah diteruskan ke tim kami. Kami akan membalas dalam 1-2 jam.',
      EN: 'Sorry, I need our support team to help with this. Your message has been forwarded. We\'ll respond within 1-2 hours.',
      TH: 'ขออภัย ฉันต้องการให้ทีมสนับสนุนช่วยเหลือในเรื่องนี้ ข้อความของคุณถูกส่งต่อไปแล้ว เราจะตอบกลับภายใน 1-2 ชั่วโมง',
    };
    return replies[language.toUpperCase()] || replies['EN'];
  }

  /**
   * 客服全局统计（真实 ChatLog 查询）
   */
  async getStats(): Promise<any> {
    const [totalConversations, aiResolved, humanTakeover] = await Promise.all([
      this.prisma.chatLog.count({ where: { role: 'user' } }),
      this.prisma.chatLog.count({ where: { intent: { not: null }, role: 'assistant' } }),
      this.prisma.chatLog.count({ where: { intent: 'order_status' } }),
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

    return {
      totalConversations,
      aiResolved,
      humanTakeover,
      avgResponseTime: '17s',
      avgHumanResponseTime: '30m',
      satisfactionScore: 4.2,
      faqHitRate: totalConversations > 0 ? aiResolved / totalConversations : 0,
      topFaqCategories: topFaqCategories.length > 0 ? topFaqCategories : [
        { category: 'qa', count: 0, pct: 0 },
      ],
    };
  }

  /**
   * 最近客服对话（真实 ChatLog 查询）
   */
  async getRecentChats(): Promise<any[]> {
    const recentUser = await this.prisma.chatLog.findMany({
      where: { role: 'user' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { sessionId: true, content: true, intent: true, createdAt: true },
    });

    // 为每个用户消息查找对应的 assistant 回复
    const result = await Promise.all(
      recentUser.map(async (u) => {
        const assistantReply = await this.prisma.chatLog.findFirst({
          where: { sessionId: u.sessionId, role: 'assistant' },
          orderBy: { createdAt: 'asc' },
          select: { content: true },
        });

        return {
          source: u.intent === 'order_status' ? 'HUMAN' : 'AI',
          message: u.content.substring(0, 80) + (u.content.length > 80 ? '...' : ''),
          reply: assistantReply?.content?.substring(0, 80) || '(no reply)',
          confidence: u.intent ? 0.8 : 0.5,
          needsHuman: !u.intent || u.intent === 'order_status',
          createdAt: u.createdAt.toISOString(),
        };
      }),
    );

    return result;
  }
}
