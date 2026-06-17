import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface UserSegment {
  segment: 'WHALE' | 'REGULAR' | 'NEW' | 'DORMANT' | 'LOST';
  label: string;
  count: number;
  pct: number;
}

export interface UserProfile {
  userId: string;
  segment: string;
  totalSpend: number;
  orderCount: number;
  avgOrderValue: number;
  lastOrderDays: number;
  churnRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  churnPct: number;
  preferredCategories: string[];
  nextBestOffer: string;
}

/**
 * UserAnalyticsService — AI 用户分析 + 个性化推荐
 *
 * RFM 分层模型：
 * - Recency（最近一次购买时间）
 * - Frequency（购买频率）
 * - Monetary（消费金额）
 *
 * 四段分层：WHALE / REGULAR / NEW / DORMANT / LOST
 * 流失预警：30天未下单 → MEDIUM，60天 → HIGH
 */
@Injectable()
export class UserAnalyticsService {
  private readonly logger = new Logger(UserAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取用户分层统计
   */
  async getSegments(): Promise<UserSegment[]> {
    const users = await this.prisma.aceUser.findMany({
      include: { orders: { select: { totalAmount: true, createdAt: true } } },
    });

    let whale = 0, regular = 0, newcomer = 0, dormant = 0, lost = 0;

    for (const u of users) {
      const spend = Number(u.totalSpend);
      const orderCount = u.orders.length;
      const lastOrder = u.orders.length > 0
        ? Math.max(...u.orders.map(o => new Date(o.createdAt).getTime()))
        : 0;
      const daysSinceLast = lastOrder ? Math.floor((Date.now() - lastOrder) / (24 * 60 * 60 * 1000)) : 999;

      if (daysSinceLast > 90) lost++;
      else if (daysSinceLast > 60) dormant++;
      else if (orderCount === 0 || daysSinceLast < 7) newcomer++;
      else if (spend > 5000000) whale++;
      else regular++;
    }

    const total = users.length || 1;
    const segments: UserSegment[] = [
      { segment: 'WHALE', label: 'Whales (>5M IDR)', count: whale, pct: Math.round(whale / total * 100) },
      { segment: 'REGULAR', label: 'Regular Users', count: regular, pct: Math.round(regular / total * 100) },
      { segment: 'NEW', label: 'New Users', count: newcomer, pct: Math.round(newcomer / total * 100) },
      { segment: 'DORMANT', label: 'Dormant (60-90d)', count: dormant, pct: Math.round(dormant / total * 100) },
      { segment: 'LOST', label: 'Lost (>90d)', count: lost, pct: Math.round(lost / total * 100) },
    ];

    return segments;
  }

  /**
   * 用户个人画像 + 推荐
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await this.prisma.aceUser.findUnique({
      where: { id: userId },
      include: {
        orders: {
          select: { totalAmount: true, createdAt: true, items: { include: { product: { select: { category: true } } } } },
        },
      },
    });

    if (!user) return null;

    const spend = Number(user.totalSpend);
    const orderCount = user.orders.length;
    const avgOrderValue = orderCount > 0 ? spend / orderCount : 0;
    const lastOrder = user.orders.length > 0
      ? Math.max(...user.orders.map(o => new Date(o.createdAt).getTime()))
      : 0;
    const lastOrderDays = lastOrder ? Math.floor((Date.now() - lastOrder) / (24 * 60 * 60 * 1000)) : 999;

    // 流失风险
    let churnRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    let churnPct: number;
    if (lastOrderDays > 60) { churnRisk = 'HIGH'; churnPct = 75; }
    else if (lastOrderDays > 30) { churnRisk = 'MEDIUM'; churnPct = 40; }
    else { churnRisk = 'LOW'; churnPct = 10; }

    // 偏好品类
    const categoryCount = new Map<string, number>();
    for (const o of user.orders) {
      for (const i of o.items) {
        const cat = i.product.category || 'OTHER';
        categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
      }
    }
    const preferredCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    // 最优推荐策略
    const segment = spend > 5000000 ? 'WHALE' : orderCount > 3 ? 'REGULAR' : 'NEW';

    const offers: Record<string, string> = {
      WHALE: 'VIP free shipping + 5% rebate',
      REGULAR: 'Bundle discount: buy 3 save 10%',
      NEW: 'Welcome offer: first order 15% off',
      DORMANT: 'Comeback coupon: 20% off + free shipping',
      LOST: 'Exclusive 30% comeback voucher',
    };

    const nextBestOffer = churnRisk === 'HIGH' ? offers['LOST'] : churnRisk === 'MEDIUM' ? offers['DORMANT'] : offers[segment];

    return {
      userId,
      segment,
      totalSpend: Math.round(spend),
      orderCount,
      avgOrderValue: Math.round(avgOrderValue),
      lastOrderDays,
      churnRisk,
      churnPct,
      preferredCategories,
      nextBestOffer,
    };
  }

  /**
   * 流失用户列表
   */
  async getChurnRiskUsers(minRisk: 'MEDIUM' | 'HIGH' = 'MEDIUM', limit = 50) {
    const users = await this.prisma.aceUser.findMany({
      include: { orders: { select: { createdAt: true } } },
    });

    const atRisk: { userId: string; email: string; daysSinceLast: number; totalSpend: number; churnRisk: string }[] = [];

    for (const u of users) {
      const lastOrder = u.orders.length > 0
        ? Math.max(...u.orders.map(o => new Date(o.createdAt).getTime()))
        : 0;
      const daysSinceLast = lastOrder ? Math.floor((Date.now() - lastOrder) / (24 * 60 * 60 * 1000)) : 999;

      let risk: string;
      if (daysSinceLast > 60) risk = 'HIGH';
      else if (daysSinceLast > 30) risk = 'MEDIUM';
      else continue;

      if (minRisk === 'HIGH' && risk !== 'HIGH') continue;

      atRisk.push({
        userId: u.id,
        email: u.email,
        daysSinceLast,
        totalSpend: Number(u.totalSpend),
        churnRisk: risk,
      });
    }

    atRisk.sort((a, b) => b.daysSinceLast - a.daysSinceLast);
    return atRisk.slice(0, limit);
  }

  /**
   * 个性化推荐（协同过滤简化版）
   */
  async getPersonalizedRecommendations(userId: string, limit = 8) {
    const profile = await this.getUserProfile(userId);
    if (!profile) return [];

    const categories = profile.preferredCategories.length > 0
      ? profile.preferredCategories
      : ['FASHION', 'BEAUTY'];

    const products = await this.prisma.aceProduct.findMany({
      where: {
        status: 'ACTIVE',
        category: { in: categories },
      },
      take: limit,
      orderBy: { ratingCount: 'desc' },
      select: { id: true, name: true, priceIdr: true, category: true, imageUrls: true, ratingAvg: true },
    });

    return products.map(p => ({
      ...p,
      priceIdr: Number(p.priceIdr),
      ratingAvg: Number(p.ratingAvg),
      recommendedBecause: profile.preferredCategories.includes(p.category || '')
        ? `You love ${p.category}`
        : 'Trending now',
    }));
  }
}
