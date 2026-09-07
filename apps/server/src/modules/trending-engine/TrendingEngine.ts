import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { Alibaba1688Service } from '../intelligence/Alibaba1688Service';
import { ScraplingFetcher } from '../intelligence/ScraplingFetcher';

export interface HotProduct {
  productId: string;
  name: string;
  shopeePrice: number;
  '1688sourcePrice': number;
  arbitrageGapPct: number;
  weeklyGrowth: number;
  trend: 'RISING' | 'STABLE' | 'DECLINING';
  category: string;
  shopeeUrl?: string;
  shopeeSales?: number;
}

/**
 * TrendingEngine — AI 爆款引擎 v2
 *
 * 策略：Shopee/Lazada 热榜抓取 → 1688 搜同款 → 计算利差 → 自动推荐上架
 *
 * 后端优先级：
 * 1. Shopee Open API (SHOPEE_PARTNER_ID + SHOPEE_PARTNER_KEY)
 * 2. Web 抓取 (Playwright/Puppeteer fallback)
 * 3. 本地模拟数据 (DEV_MOCK)
 */
@Injectable()
export class TrendingEngine {
  private readonly logger = new Logger(TrendingEngine.name);

  private readonly hotCategories = [
    'FASHION', 'BEAUTY', 'ELECTRONICS', 'HOME', 'TOYS',
    'AUTOMOTIVE', 'SPORTS', 'FOOD', 'BABY', 'PET',
  ];

  // 各国家 Shopee 站点配置
  private static readonly SITES: Record<string, { domain: string; currency: string }> = {
    ID: { domain: 'shopee.co.id', currency: 'IDR' },
    TH: { domain: 'shopee.co.th', currency: 'THB' },
    PH: { domain: 'shopee.ph', currency: 'PHP' },
    MY: { domain: 'shopee.com.my', currency: 'MYR' },
    SG: { domain: 'shopee.sg', currency: 'SGD' },
    VN: { domain: 'shopee.vn', currency: 'VND' },
    BR: { domain: 'shopee.com.br', currency: 'BRL' },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly alibaba1688: Alibaba1688Service,
    private readonly config: ConfigService,
    private readonly scrapling: ScraplingFetcher,
  ) {}

  /**
   * 扫描热榜 → 1688 比价
   */
  async scanHotProducts(country: string, limit = 20): Promise<HotProduct[]> {
    const site = TrendingEngine.SITES[country.toUpperCase()];
    if (!site) {
      this.logger.warn(`[Trending] Unknown country: ${country}, falling back to ID`);
    }

    // 1. 获取 Shopee 热榜
    const rawHotlist = await this.fetchShopeeHotlist(country, limit);

    // 2. 对每个热品搜索 1688 真实比价
    const results: HotProduct[] = [];
    for (const item of rawHotlist) {
      let sourcePrice: number;
      if (this.alibaba1688.isConfigured()) {
        try {
          const searchResults = await this.alibaba1688.searchProducts(item.name, 1, 1);
          sourcePrice = searchResults[0]?.price || this.estimate1688Price(item.shopeePrice);
        } catch {
          sourcePrice = this.estimate1688Price(item.shopeePrice);
        }
      } else {
        sourcePrice = this.estimate1688Price(item.shopeePrice);
      }

      const gap = Math.round((1 - sourcePrice / item.shopeePrice) * 100);

      results.push({
        productId: `HOT-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
        name: item.name,
        shopeePrice: Math.round(item.shopeePrice),
        '1688sourcePrice': Math.round(sourcePrice),
        arbitrageGapPct: gap,
        weeklyGrowth: item.weeklyGrowth,
        trend: item.trend,
        category: item.category,
        shopeeUrl: item.shopeeUrl,
        shopeeSales: item.shopeeSales,
      });
    }

    results.sort((a, b) => b.arbitrageGapPct - a.arbitrageGapPct);
    this.logger.log(`[Trending] ${country}: ${results.length} products scanned. Top gap: ${results[0]?.arbitrageGapPct}%`);

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
    const products = await this.scanHotProducts(country, 30);

    // 按品类聚合
    const categoryMap = new Map<string, { products: HotProduct[]; totalGap: number; rising: number }>();
    for (const p of products) {
      if (!categoryMap.has(p.category)) {
        categoryMap.set(p.category, { products: [], totalGap: 0, rising: 0 });
      }
      const c = categoryMap.get(p.category)!;
      c.products.push(p);
      c.totalGap += p.arbitrageGapPct;
      if (p.trend === 'RISING') c.rising++;
    }

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      hotProducts: data.products.length,
      avgArbitrageGap: Math.round(data.totalGap / data.products.length),
      risingCount: data.rising,
      trend: data.rising > data.products.length * 0.5 ? 'RISING' : data.rising > data.products.length * 0.3 ? 'STABLE' : 'DECLINING',
      seasonality: this.getSeasonality(category),
      topProduct: data.products[0]?.name,
    }));
  }

  /**
   * 自动将高利差产品推入商品表
   */
  async autoListTopOpportunities(country: string, maxCount = 5): Promise<number> {
    const recommendations = await this.getListingRecommendations(country);
    const toList = recommendations.slice(0, maxCount);

    let count = 0;
    for (const rec of toList) {
      try {
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
        this.logger.log(`[Trending] Auto-listed: ${rec.name} (gap: ${rec.arbitrageGapPct}%)`);
      } catch (e) {
        this.logger.warn(`[Trending] Failed to list ${rec.name}: ${e}`);
      }
    }

    this.logger.log(`[Trending] Auto-listed ${count}/${toList.length} products for ${country}`);
    return count;
  }

  // ─── Shopee 热榜抓取 ───

  private async fetchShopeeHotlist(country: string, limit: number) {
    // 1. 尝试 Shopee Open API
    if (this.isShopeeApiConfigured()) {
      try {
        return await this.fetchViaShopeeAPI(country, limit);
      } catch (e) {
        this.logger.warn(`[Trending] Shopee API failed, trying web scrape: ${e}`);
      }
    }

    // 2. 尝试 Web 抓取
    try {
      return await this.fetchViaWebScrape(country, limit);
    } catch (e) {
      this.logger.warn(`[Trending] Web scrape failed, using simulation: ${e}`);
    }

    // 3. 模拟数据 fallback
    return this.generateSimulatedHotlist(country, limit);
  }

  private isShopeeApiConfigured(): boolean {
    return !!(this.config.get<string>('SHOPEE_PARTNER_ID') && this.config.get<string>('SHOPEE_PARTNER_KEY'));
  }

  /**
   * Shopee Open API 调用
   * 参考：https://open.shopee.com/documents
   */
  private async fetchViaShopeeAPI(country: string, limit: number) {
    const partnerId = this.config.get<string>('SHOPEE_PARTNER_ID')!;
    const partnerKey = this.config.get<string>('SHOPEE_PARTNER_KEY')!;
    const apiUrl = this.config.get<string>('SHOPEE_API_URL') || 'https://partner.shopeemobile.com/api/v2';

    const timestamp = Math.floor(Date.now() / 1000);
    const path = '/api/v2/product/get_popular_search';

    // Shopee 签名算法
    const signBase = `${partnerId}${path}${timestamp}`;
    const sign = crypto.createHmac('sha256', partnerKey).update(signBase).digest('hex');

    const response = await fetch(`${apiUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        partner_id: Number(partnerId),
        timestamp,
        sign,
        country: country.toUpperCase(),
        limit,
      }),
    });

    if (!response.ok) {
      throw new Error(`Shopee API returned ${response.status}`);
    }

    const data = await response.json() as any;
    if (data.error) {
      throw new Error(`Shopee API error: ${data.error} - ${data.message}`);
    }

    return this.parseShopeeApiResponse(data, country);
  }

  /**
   * Web 抓取 Shopee 热榜（Scrapling stealth fetcher）
   */
  private async fetchViaWebScrape(country: string, limit: number) {
    const site = TrendingEngine.SITES[country.toUpperCase()] || TrendingEngine.SITES['ID'];
    const searchUrl = `https://${site.domain}/search?sortBy=ctime&order=desc&page=0`;

    this.logger.log(`[Trending] Scraping Shopee ${country} hotlist with ScraplingFetcher`);

    try {
      const html = await this.scrapling.get(searchUrl, { 
        timeout: 15000,
        country,
      });

      // Use Scrapling's structured data extraction
      const extractedProducts = this.extractProductsFromHTML(html, country, limit);

      if (extractedProducts.length > 0) {
        this.logger.log(`[Trending] Scrapling extracted ${extractedProducts.length} products from Shopee ${country}`);
        return extractedProducts;
      }
    } catch (e) {
      this.logger.warn(`[Trending] Scrapling fetch failed: ${e}`);
    }

    // Fallback to basic fetch
    try {
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (response.ok) {
        const html = await response.text();
        const extractedProducts = this.extractProductsFromHTML(html, country, limit);
        if (extractedProducts.length > 0) {
          return extractedProducts;
        }
      }
    } catch { /* final fallback */ }

    throw new Error('Web scrape returned no results');
  }

  /**
   * 从 Shopee HTML 提取商品数据
   */
  private extractProductsFromHTML(html: string, country: string, limit: number) {
    const items: any[] = [];

    // 尝试解析 __NEXT_DATA__ JSON
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const itemList = nextData?.props?.initialState?.search?.itemList || [];
        for (const item of itemList.slice(0, limit)) {
          items.push({
            name: item.name || item.title || 'Unknown Product',
            shopeePrice: this.parseShopeePrice(item.price, country),
            weeklyGrowth: this.estimateGrowth(item.sold || 0, item.historical_sold || 0),
            trend: (item.sold > 100 ? 'RISING' : 'STABLE') as any,
            category: this.mapCategory(item.catid || 0),
            shopeeUrl: `https://shopee.${country.toLowerCase()}/product/${item.shopid}/${item.itemid}`,
            shopeeSales: item.sold || 0,
          });
        }
      } catch { /* parse error, continue */ }
    }

    // fallback: 解析 JSON-LD structured data
    if (items.length === 0) {
      const ldJsonMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
      if (ldJsonMatch) {
        for (const match of ldJsonMatch.slice(0, limit)) {
          try {
            const ld = JSON.parse(match.replace(/<[^>]*>/g, ''));
            if (ld['@type'] === 'Product') {
              items.push({
                name: ld.name,
                shopeePrice: parseFloat(ld.offers?.price || '0'),
                weeklyGrowth: Math.random() * 30 + 5,
                trend: 'RISING',
                category: 'GENERAL',
                shopeeUrl: ld.url,
                shopeeSales: 0,
              });
            }
          } catch { /* continue */ }
        }
      }
    }

    return items;
  }

  // ─── 模拟数据生成器（API 不可用时的 fallback） ───

  private generateSimulatedHotlist(country: string, limit: number) {
    this.logger.warn(`[Trending] DEV_MOCK: using simulated Shopee hotlist for ${country}`);

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
      const category = this.hotCategories[Math.floor(Math.random() * this.hotCategories.length)];
      items.push({
        name: names[i],
        shopeePrice: Math.floor(Math.random() * 200) * 1000 + 50000,
        weeklyGrowth: Math.round((Math.random() * 50 - 10) * 10) / 10,
        trend: (Math.random() > 0.6 ? 'RISING' : Math.random() > 0.3 ? 'STABLE' : 'DECLINING') as any,
        category,
        shopeeUrl: undefined,
        shopeeSales: Math.floor(Math.random() * 500),
      });
    }

    return items;
  }

  // ─── 辅助方法 ───

  private parseShopeeApiResponse(data: any, country: string) {
    const items = data.response?.item_list || data.data?.items || [];
    return items.slice(0, 50).map((item: any) => ({
      name: item.item_name || item.name,
      shopeePrice: item.price_min || item.price || 0,
      weeklyGrowth: this.estimateGrowth(item.sold || 0, item.historical_sold || 0),
      trend: (item.sold > 100 ? 'RISING' : 'STABLE') as any,
      category: this.mapCategory(item.category_id || 0),
      shopeeUrl: `https://shopee.${country.toLowerCase()}/product/${item.shopid}/${item.itemid}`,
      shopeeSales: item.sold || 0,
    }));
  }

  private parseShopeePrice(price: any, country: string): number {
    if (typeof price === 'number') return price;
    if (typeof price === 'string') return parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    return 0;
  }

  private estimateGrowth(currentSold: number, historicalSold: number): number {
    if (historicalSold <= 0) return currentSold > 0 ? 50 : 0;
    return +((currentSold - historicalSold) / historicalSold * 100).toFixed(1);
  }

  private mapCategory(catId: number): string {
    const map: Record<number, string> = {
      100017: 'FASHION', 100009: 'BEAUTY', 100011: 'ELECTRONICS',
      100010: 'HOME', 100014: 'TOYS', 100019: 'SPORTS',
      100015: 'BABY', 100016: 'PET',
    };
    return map[catId] || 'GENERAL';
  }

  private getSeasonality(category: string): string {
    const seasonal: Record<string, string> = {
      FASHION: 'HIGH', BEAUTY: 'HIGH', TOYS: 'MEDIUM',
      ELECTRONICS: 'MEDIUM', SPORTS: 'MEDIUM',
      HOME: 'LOW', BABY: 'LOW', PET: 'LOW',
    };
    return seasonal[category] || 'MEDIUM';
  }

  private estimate1688Price(shopeePrice: number): number {
    return shopeePrice * (0.2 + Math.random() * 0.3);
  }
}
