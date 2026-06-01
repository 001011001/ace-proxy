import { Injectable, Logger } from '@nestjs/common';
import { StationService } from '../station/StationService';
import { PatentRiskChecker } from './PatentRiskChecker';

@Injectable()
export class SentinelScraper {
  private readonly logger = new Logger(SentinelScraper.name);

  constructor(
    private readonly stationService: StationService,
    private readonly patentChecker: PatentRiskChecker
  ) {}

  /**
   * 立即运行 Sentinel 抓取任务
   * 模拟从 1688 抓取爆款并灌入 Station 首页
   */
  async runScraper(categories: string[]) {
    this.logger.log(`[Sentinel] Starting scraper for categories: ${categories.join(', ')}`);
    
    // 模拟 1688 抓取结果
    const rawProducts = categories.flatMap((cat, index) => [
      {
        id: `1688-${cat}-${index}`,
        title: `${cat} - 1688 源头货源`,
        price: (Math.random() * 50 + 10).toFixed(2),
        amazonPrice: (Math.random() * 100 + 100).toFixed(2),
        margin: '180%',
        image: `https://picsum.photos/seed/${cat}/200/200`
      }
    ]);

    // 专利与品牌风险过滤 (Patent Sentry Filter)
    const mockProducts = [];
    for (const p of rawProducts) {
      const risk = await this.patentChecker.checkRisk(p.title);
      if (risk.isHighRisk) {
        this.logger.warn(`[Sentinel] SCRAPER_INTERCEPT: "${p.title}" skipped. Reason: ${risk.reason}`);
        continue;
      }
      mockProducts.push(p);
    }

    this.logger.log(`[Sentinel] Scraped ${mockProducts.length} safe products. Ingesting into Station...`);
    
    // 调用 StationService 灌入数据
    await this.stationService.updateTrendingProducts(mockProducts);
    
    return {
      status: 'SUCCESS',
      scrapedCount: mockProducts.length,
      timestamp: new Date().toISOString()
    };
  }
}
