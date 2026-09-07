import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * 单次对话记忆条目
 */
interface MemoryEntry {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: number;
}

/**
 * 用户画像（长期记忆）
 */
/**
 * 用户画像（长期记忆）
 *
 * 注意：需 export —— 因为 ConversationMemory.getUserProfile() 是 public 方法，
 * 其返回类型被 Controller 暴露，未导出会导致 TS4053（类型无法被命名）。
 */
export interface UserProfile {
  userId: string;
  totalOrders: number;
  totalSpend: number;
  level: string;
  preferredLanguage: string;
  country?: string;
  recentTopics: string[];
  pendingIssues: string[];
  lastInteractionAt: Date;
}

/**
 * ConversationMemory — 对话记忆系统
 *
 * 两层记忆：
 * 1. 短期记忆 — 当前会话的对话历史（最多30轮）
 * 2. 长期记忆 — 用户画像（持久化到 ChatLog 并从中推断）
 *
 * 用途：
 * - 多轮上下文理解："我的订单到哪了？" → "什么时候能到？"（AI记得是同一订单）
 * - 个性化回复：根据用户等级/历史行为调整语气
 * - 问题追踪：记住未解决的问题，主动跟进
 */
@Injectable()
export class ConversationMemory {
  private readonly logger = new Logger(ConversationMemory.name);

  /** 短期记忆：sessionId → 对话条目 */
  private shortTermMemory = new Map<string, MemoryEntry[]>();

  /** 用户画像缓存：userId → UserProfile */
  private userProfileCache = new Map<string, UserProfile>();

  /** 每会话最大保留轮数 */
  private readonly MAX_TURNS = 30;

  constructor(private readonly prisma: PrismaService) {}

  // ─── 短期记忆（当前会话）─────────────────────────────────

  /**
   * 添加消息到当前会话
   */
  addMessage(sessionId: string, role: 'user' | 'assistant' | 'tool', content: string): void {
    if (!this.shortTermMemory.has(sessionId)) {
      this.shortTermMemory.set(sessionId, []);
    }

    const entries = this.shortTermMemory.get(sessionId)!;
    entries.push({ role, content, timestamp: Date.now() });

    // 保持最多 MAX_TURNS 轮
    if (entries.length > this.MAX_TURNS * 2) {
      this.shortTermMemory.set(sessionId, entries.slice(-this.MAX_TURNS * 2));
    }
  }

  /**
   * 获取当前会话的对话历史（用于注入 LLM 提示词）
   */
  getHistory(sessionId: string): Array<{ role: string; content: string }> {
    const entries = this.shortTermMemory.get(sessionId) || [];
    return entries.map((e) => ({ role: e.role, content: e.content }));
  }

  /**
   * 获取最近 N 轮对话摘要（节省 token）
   */
  getRecentSummary(sessionId: string, maxTurns: number = 5): string {
    const entries = this.shortTermMemory.get(sessionId) || [];
    const recent = entries.slice(-maxTurns * 2);
    return recent
      .map((e) => `${e.role === 'user' ? 'Customer' : 'Agent'}: ${e.content.substring(0, 200)}`)
      .join('\n');
  }

  /**
   * 提取当前会话中的关键实体（订单号、金额等）
   */
  extractEntities(sessionId: string): { orderId?: string; productId?: string; amount?: number } {
    const entries = this.shortTermMemory.get(sessionId) || [];
    const allText = entries.map((e) => e.content).join(' | ');

    const entities: { orderId?: string; productId?: string; amount?: number } = {};

    // 匹配订单号
    const orderMatch = allText.match(/(?:order|pesanan|订单)[\s#-]*(\w{4,})/i);
    if (orderMatch) entities.orderId = orderMatch[1];

    // 匹配金额
    const amountMatch = allText.match(/(?:Rp|IDR)\s*([\d.,]+)/i);
    if (amountMatch) entities.amount = parseFloat(amountMatch[1].replace(/,/g, ''));

    return entities;
  }

  /**
   * 清除指定会话的短期记忆
   */
  clearSession(sessionId: string): void {
    this.shortTermMemory.delete(sessionId);
  }

  // ─── 长期记忆（用户画像）─────────────────────────────────

  /**
   * 获取用户画像（从缓存或数据库）
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    // 先查缓存
    const cached = this.userProfileCache.get(userId);
    if (cached) {
      // 缓存有效期 30 分钟
      if (Date.now() - cached.lastInteractionAt.getTime() < 30 * 60 * 1000) {
        return cached;
      }
    }

    try {
      const user = await this.prisma.aceUser.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          level: true,
          totalSpend: true,
          createdAt: true,
          orders: { orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, status: true, country: true } },
        },
      });

      if (!user) return null;

      // 从 ChatLog 分析最近话题
      const recentChats = await this.prisma.chatLog.findMany({
        where: { userId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        select: { intent: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      const recentTopics = [...new Set(recentChats.map((c) => c.intent).filter(Boolean))] as string[];

      const profile: UserProfile = {
        userId,
        totalOrders: user.orders.length,
        totalSpend: Number(user.totalSpend || 0),
        level: user.level,
        preferredLanguage: user.orders[0]?.country === 'TH' ? 'TH' : user.orders[0]?.country === 'PH' ? 'EN' : 'ID',
        country: user.orders[0]?.country || 'ID',
        recentTopics,
        pendingIssues: user.orders.filter((o) => o.status === 'PENDING' || o.status === 'ISSUE').map((o) => o.id),
        lastInteractionAt: new Date(),
      };

      this.userProfileCache.set(userId, profile);
      return profile;
    } catch (e: any) {
      this.logger.warn(`[Memory] Failed to load profile for ${userId}: ${e.message}`);
      return null;
    }
  }

  /**
   * 将用户画像注入提示词
   */
  async buildProfileContext(userId: string): Promise<string> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return '';

    const parts: string[] = [];
    parts.push('## CUSTOMER PROFILE (use this to personalize your response):');
    parts.push(`- Level: ${profile.level} (${profile.totalOrders} orders, Rp ${profile.totalSpend.toLocaleString('id-ID')} total spend)`);
    if (profile.country) parts.push(`- Country: ${profile.country}`);
    if (profile.recentTopics.length > 0) parts.push(`- Recent topics: ${profile.recentTopics.slice(0, 3).join(', ')}`);
    if (profile.pendingIssues.length > 0) parts.push(`- Active orders: ${profile.pendingIssues.join(', ')}`);

    return parts.join('\n');
  }

  /**
   * 生成问候语（根据用户画像个性化）
   */
  generateGreeting(profile: UserProfile): string {
    const templates: Record<string, Record<string, string>> = {
      EXPLORER: {
        ID: 'Halo! Selamat datang di AceProxy. Ada yang bisa saya bantu?',
        EN: 'Hi! Welcome to AceProxy. How can I help you today?',
        TH: 'สวัสดี! ยินดีต้อนรับสู่ AceProxy มีอะไรให้ฉันช่วยไหม?',
      },
      MEMBER: {
        ID: 'Halo lagi! Senang melihat Anda kembali. Ada yang bisa saya bantu?',
        EN: 'Welcome back! Great to see you again. How can I help?',
        TH: 'สวัสดีอีกครั้ง! ดีใจที่ได้พบคุณอีกครั้ง มีอะไรให้ช่วยไหม?',
      },
      VIP: {
        ID: 'Selamat datang kembali! Terima kasih telah menjadi pelanggan setia AceProxy. Ada yang bisa saya bantu hari ini?',
        EN: 'Welcome back, valued customer! Thank you for being a loyal AceProxy member. What can I help with today?',
        TH: 'ยินดีต้อนรับกลับ! ขอบคุณที่เป็นสมาชิกที่ภักดีของ AceProxy วันนี้มีอะไรให้ช่วยไหม?',
      },
    };

    const level = profile.level || 'EXPLORER';
    const lang = profile.preferredLanguage || 'ID';
    return (templates[level]?.[lang]) || templates['EXPLORER']['EN'];
  }
}
