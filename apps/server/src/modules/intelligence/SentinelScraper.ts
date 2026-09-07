import { Injectable, Logger } from '@nestjs/common';
import { StationService } from '../station/StationService';
import { PatentRiskChecker } from './PatentRiskChecker';
import { Alibaba1688Service } from './Alibaba1688Service';
import { ScraplingFetcher } from './ScraplingFetcher';
import { ConfigurationError, isDevMockEnabled } from '../../common/ConfigurationError';

@Injectable()
export class SentinelScraper {
  private readonly logger = new Logger(SentinelScraper.name);

  // Trending Shopee search pages per category (public, scrape-able)
  private static readonly SHOPEE_SEARCH_URLS: Record<string, string> = {
    FASHION: 'https://shopee.co.id/search?keyword=fashion%20wanita&sortBy=sales&order=desc',
    BEAUTY: 'https://shopee.co.id/search?keyword=skincare&sortBy=sales&order=desc',
    ELECTRONICS: 'https://shopee.co.id/search?keyword=aksesoris%20hp&sortBy=sales&order=desc',
    HOME: 'https://shopee.co.id/search?keyword=dekorasi%20rumah&sortBy=sales&order=desc',
    TOYS: 'https://shopee.co.id/search?keyword=mainan%20anak&sortBy=sales&order=desc',
    DEFAULT: 'https://shopee.co.id/search?keyword=produk%20viral&sortBy=sales&order=desc',
  };

  constructor(
    private readonly stationService: StationService,
    private readonly patentChecker: PatentRiskChecker,
    private readonly alibaba1688: Alibaba1688Service,
    private readonly scrapling: ScraplingFetcher,
  ) {}

  /**
   * 运行 Sentinel 抓取任务 — 三层策略
   * 1. 1688 官方 API（优先）
   * 2. Shopee 热榜 Scrapling 抓取 + 1688 比价
   * 3. 模拟数据 fallback（开发环境）
   */
  async runScraper(categories: string[]) {
    this.logger.log(`[Sentinel] Starting scraper for categories: ${categories.join(', ')}`);
    
    let rawProducts: Array<{ id: string; title: string; price: number; image: string }> = [];

    // Strategy 1: Try 1688 API first
    if (this.alibaba1688.isConfigured()) {
      try {
        for (const cat of categories.slice(0, 3)) {
          const results = await this.alibaba1688.searchProducts(cat, 3, 1);
          for (const r of results) {
            rawProducts.push({
              id: r.offerId || `1688-${Date.now()}`,
              title: r.title || `${cat} Product`,
              price: r.price || 0,
              image: r.image || '',
            });
          }
        }
        if (rawProducts.length > 0) {
          this.logger.log(`[Sentinel] ✅ 1688 API: ${rawProducts.length} products`);
        }
      } catch (e) {
        this.logger.warn(`[Sentinel] 1688 API failed: ${e}`);
      }
    }

    // Strategy 2: Scrapling web scrape + 1688 price estimate
    if (rawProducts.length === 0) {
      try {
        for (const cat of categories) {
          const searchUrl = SentinelScraper.SHOPEE_SEARCH_URLS[cat] || SentinelScraper.SHOPEE_SEARCH_URLS['DEFAULT'];
          const html = await this.scrapling.get(searchUrl, { country: 'ID', timeout: 12000 });
          const productData = await this.scrapling.extractProductData(html);
          
          for (const p of productData.slice(0, 5)) {
            rawProducts.push({
              id: `shopee-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              title: p.name,
              price: this.estimate1688Price(p.price),
              image: p.imageUrl || '',
            });
          }
        }
        this.logger.log(`[Sentinel] Scrapling: ${rawProducts.length} products from Shopee`);
      } catch (e) {
        this.logger.warn(`[Sentinel] Scrapling failed: ${e}`);
      }
    }

    // Strategy 3: Mock fallback (DEV only)
    if (rawProducts.length === 0) {
      if (!isDevMockEnabled()) {
        throw new ConfigurationError('SentinelScraper', [
          'ALIBABA_APP_KEY (need real 1688 API)',
          'SCRAPER_PROXY_URL (optional, for Scrapling)',
        ]);
      }
      this.logger.warn('[Sentinel] DEV_MOCK: using simulated data');
      rawProducts = categories.flatMap((cat, index) => [{
        id: `1688-${cat}-${index}`,
        title: `${cat} - 1688 源头货源`,
        price: Math.random() * 50 + 10,
        image: `https://picsum.photos/seed/${cat}/200/200`,
      }]);
    }

    // Patent risk filtering
    const safeProducts = [];
    for (const p of rawProducts) {
      const risk = await this.patentChecker.checkRisk(p.title);
      if (risk.isHighRisk) {
        this.logger.warn(`[Sentinel] BLOCKED: "${p.title}" — ${risk.reason}`);
        continue;
      }
      safeProducts.push({
        ...p,
        price: p.price.toFixed(2),
        amazonPrice: (p.price * 3.5).toFixed(2),
        margin: this.calculateMargin(p.price),
      });
    }

    this.logger.log(`[Sentinel] ${safeProducts.length}/${rawProducts.length} safe products after patent filter`);
    
    // Ingest into Station
    await this.stationService.updateTrendingProducts(safeProducts);
    
    return {
      status: 'SUCCESS',
      scrapedCount: safeProducts.length,
      filteredCount: rawProducts.length - safeProducts.length,
      timestamp: new Date().toISOString(),
    };
  }

  /** Estimate 1688 factory price from Shopee retail price */
  private estimate1688Price(retailPrice: number): number {
    // Shopee retail ~ 3-5x factory price
    return retailPrice * (0.2 + Math.random() * 0.15);
  }

  /** Calculate approximate margin percentage */
  private calculateMargin(factoryPrice: number): string {
    const retail = factoryPrice * 3.5;
    const margin = ((retail - factoryPrice) / factoryPrice * 100);
    return `${margin.toFixed(0)}%`;
  }
}
