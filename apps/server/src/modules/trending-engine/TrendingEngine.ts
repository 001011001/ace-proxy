import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Alibaba1688Service } from '../intelligence/Alibaba1688Service';
import { ConfigurationError, isDevMockEnabled } from '../../common/ConfigurationError';

export interface HotProduct {
  productId: string;
  name: string;
  shopeePrice: number;
  '1688sourcePrice': number;
  arbitrageGapPct: number;
  weeklyGrowth: number;
  trend: 'RISING' | 'STABLE' | 'DECLINING';
  category: string;
}

/**
 * TrendingEngine — AI 爆款引擎
 *
 * 策略：监测 Shopee/印尼电商热榜 → 1688 搜同款 → 计算利差 →
 * 自动推荐上架（对接 AutoListingService）
 *
 * 当前使用模拟数据，P2 接入真实 Shopee API / 爬虫
 */
@Injectable()
export class TrendingEngine {
  private readonly logger = new Logger(TrendingEngine.name);

  // 模拟 Shopee 热榜
  private readonly hotCategories = ['FASHION', 'BEAUTY', 'ELECTRONICS', 'HOME', 'TOYS'];

  constructor(
    private readonly prisma: PrismaService,
    private readonly alibaba1688: Alibaba1688Service,
  ) {}

  /**
   * 获取 Shopee 热榜→1688 比价结果
   */
  async scanHotProducts(country: string, limit = 20): Promise<HotProduct[]> {
    // 当前不支持真实 Shopee API — 开发模式可用 mock
    if (!isDevMockEnabled()) {
      throw new ConfigurationError('TrendingEngine', ['SHOPEE_API_KEY', 'SHOPEE_AFFILIATE_ID']);
    }
    this.logger.warn('[TrendingEngine] DEV_MOCK: using simulated Shopee hotlist');

    // 1. 模拟 Shopee 热榜抓取
    const rawHotlist = this.simulateShopeeHotlist(country, limit);

    // 2. 对每个热品搜索 1688 真实比价
    const results: HotProduct[] = [];
    for (const item of rawHotlist) {
      let sourcePrice: number;
      if (this.alibaba1688.isConfigured()) {
        try {
          const searchResults = await this.alibaba1688.searchProducts(item.name, 1, 1);
          sourcePrice = searchResults[0]?.price || this.simulate1688Price(item.shopeePrice);
        } catch {
          sourcePrice = this.simulate1688Price(item.shopeePrice);
        }
      } else {
        sourcePrice = this.simulate1688Price(item.shopeePrice);
      }
      const gap = Math.round((1 - sourcePrice / item.shopeePrice) * 100);

      results.push({
        productId: `HOT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: item.name,
        shopeePrice: item.shopeePrice,
        '1688sourcePrice': Math.round(sourcePrice),
        arbitrageGapPct: gap,
        weeklyGrowth: item.weeklyGrowth,
        trend: item.trend,
        category: item.category,
      });
    }

    // 按利差排序，利差>30%为推荐
    results.sort((a, b) => b.arbitrageGapPct - a.arbitrageGapPct);

    this.logger.log(`[Trending] Scanned ${results.length} hot products for ${country}. Top gap: ${results[0]?.arbitrageGapPct}%`);

    return results;
  }

  /**
   * 获取推荐上架清单（利差>30% + 上升趋势）
   */
  async getListingRecommendations(country: string): Promise<HotProduct[]> {
    const all = await this.scanHotProducts(country, 50);
    return all
      .filter(p => p.arbitrageGapPct > 30 && p.trend === 'RISING')
      .slice(0, 10);
  }

  /**
   * 品类趋势分析
   */
  async getCategoryTrends(country: string) {
    return this.hotCategories.map(cat => ({
      category: cat,
      hotProducts: Math.floor(Math.random() * 20) + 5,
      avgArbitrageGap: Math.floor(Math.random() * 40) + 20,
      trend: Math.random() > 0.3 ? 'RISING' : 'STABLE',
      seasonality: cat === 'FASHION' ? 'HIGH' : 'MEDIUM',
    }));
  }

  /**
   * 自动将高利差产品推入 AutoListing
   */
  async autoListTopOpportunities(country: string, maxCount = 5): Promise<number> {
    const recommendations = await this.getListingRecommendations(country);
    const toList = recommendations.slice(0, maxCount);

    let count = 0;
    for (const rec of toList) {
      try {
        // 创建商品记录
        await this.prisma.aceProduct.create({
          data: {
            name: rec.name,
            category: rec.category,
            priceIdr: rec.shopeePrice,
            costCny: rec['1688sourcePrice'],
            stock: 999,
          },
        });
        count++;
      } catch (e) {
        this.logger.warn(`[Trending] Failed to list ${rec.name}: ${e}`);
      }
    }

    this.logger.log(`[Trending] Auto-listed ${count}/${toList.length} products`);
    return count;
  }

  // ─── 模拟数据生成器（生产环境替换为真实 API/爬虫） ───

  private simulateShopeeHotlist(country: string, limit: number) {
    const localNames: Record<string, string[]> = {
      ID: [
        'Tas Selempang Wanita Trendy 2026', 'Sepatu Sneakers Pria Casual', 'Powerbank 20000mAh Fast Charging',
        'Set Peralatan Dapur Silikon', 'Kaos Polo Pria Premium', 'Dress Batik Modern',
        'Tumbler Stainless Steel 500ml', 'Wireless Earbuds TWS', 'Topi Baseball Unisex',
        'Jam Tangan Digital Sport', 'Celana Jeans Stretch Pria', 'Blouse Kantor Wanita Elegan',
        'Kipas Angin Mini USB', 'Tas Ransel Laptop Anti Air', 'Parfum Pria Original',
        'Lampu Meja LED Belajar', 'Sandal Rumah Karakter Lucu', 'Set Sprei Katun Premium',
        'Keyboard Mechanical Gaming', 'Mouse Wireless Silent Click',
      ],
      TH: [
        'กระเป๋าสะพายข้างผู้หญิง', 'รองเท้าผ้าใบผู้ชาย', 'พาวเวอร์แบงค์ 20000mAh',
        'ชุดครัวซิลิโคน', 'เสื้อโปโลผู้ชาย', 'ชุดเดรสผ้าฝ้าย',
      ],
      PH: [
        'Women Sling Bag Trendy', 'Men Casual Sneakers', 'Powerbank 20000mAh',
        'Silicone Kitchen Set', 'Men Premium Polo Shirt', 'Cotton Dress Modern',
      ],
    };

    const names = localNames[country.toUpperCase()] || localNames['ID'];
    const items = [];

    for (let i = 0; i < Math.min(limit, names.length); i++) {
      items.push({
        name: names[i],
        shopeePrice: Math.floor(Math.random() * 200) * 1000 + 50000,
        weeklyGrowth: Math.round((Math.random() * 50 - 10) * 10) / 10,
        trend: (Math.random() > 0.6 ? 'RISING' : Math.random() > 0.3 ? 'STABLE' : 'DECLINING') as any,
        category: this.hotCategories[Math.floor(Math.random() * this.hotCategories.length)],
      });
    }

    return items;
  }

  private simulate1688Price(shopeePrice: number): number {
    return shopeePrice * (0.2 + Math.random() * 0.3);
  }
}
