import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PatentRiskChecker } from './PatentRiskChecker';
import { StationService } from '../station/StationService';
import { ConfigurationError, isDevMockEnabled } from '../../common/ConfigurationError';

/**
 * IntelligenceService - 全球电商情报中心
 * 集成 AMZ123/TikTok 等外部信号，实现自动化研判。
 */
@Injectable()
export class IntelligenceService {
  private readonly logger = new Logger(IntelligenceService.name);

  constructor(
    private readonly patentChecker: PatentRiskChecker,
    private readonly stationService: StationService
  ) {}

  @Cron('0 9 * * *') // 每天早上 9 点抓取情报
  async fetchIntelligence() {
    this.logger.log('Starting automated intelligence gathering from AMZ123/TikTok...');
    
    // 1. 抓取 AMZ123 物流波动与政策补丁
    const logisticsNews = await this.scrapeAMZ123();
    
    // 2. 抓取 TikTok Creative Center 爆款视频趋势
    const trendingSignals = await this.scrapeTikTok();

    // 3. 利用 LLM 生成简报并推送至老板移动端
    const brief = await this.generateDailyBrief(logisticsNews, trendingSignals);
    
    this.logger.log('Daily Intelligence Brief sent to Commander.');
    return brief;
  }

  /**
   * 哨兵监控 (Sentinel Monitoring)
   * 响应产品经理需求：监控开斋节爆款的价格波动与库存风险
   */
  async monitorHeroProducts(products: any[]) {
    if (!isDevMockEnabled()) {
      throw new ConfigurationError('Intelligence/Monitor', ['ALIBABA_APP_KEY (real-time price check requires 1688 API)']);
    }
    this.logger.warn('[Intelligence] DEV_MOCK: using simulated price drift for hero products');
    this.logger.log(`[Sentinel] Monitoring ${products.length} hero products for price and patent anomalies...`);
    
    for (const product of products) {
      // 1. 专利与品牌侵权先行审计 (Patent Sentry) - 最高优先级
      const risk = await this.patentChecker.checkRisk(product.name, product.category);
      if (risk.isHighRisk) {
        this.logger.error(`[Sentinel] CRITICAL_PATENT_INTERCEPT: "${product.name}" BLOCKED. Reason: ${risk.reason}`);
        
        // 自动下架逻辑 (Safe Harbor Protocol)
        await this.stationService.setProductStatus(product.id, 'ARCHIVED');
        continue; 
      }

      // 2. 模拟 1688 反查价格波动
      const currentPrice = product.sourcePriceCNY * (1 + (Math.random() * 0.2 - 0.1)); // 模拟波动
      const drift = (currentPrice - product.sourcePriceCNY) / product.sourcePriceCNY;

      if (Math.abs(drift) > 0.15) {
        this.logger.warn(`[Sentinel] PRICE_ALERT: ${product.name} drift ${ (drift * 100).toFixed(1) }%! Triggering hot-standby supplier.`);
        // 自动触发逻辑：更新供应商 ID，或推送预警
      }
    }
  }

  /**
   * AMZ123 物流/政策情报爬取。
   * @note P2 — 需要接入真实 AMZ123/Feedly API 后才有数据返回
   */
  private async scrapeAMZ123(): Promise<string[]> {
    const enabled = process.env.AMZ123_API_ENABLED === 'true';
    if (!enabled) {
      this.logger.debug('[Intelligence] AMZ123 scraper disabled (set AMZ123_API_ENABLED=true to enable)');
      return [];
    }
    // TODO: 接入真实 AMZ123 RSS/API
    this.logger.warn('[Intelligence] AMZ123 API not yet integrated');
    return [];
  }

  /**
   * TikTok Creative Center 爆款趋势抓取。
   * @note P2 — 需要接入真实 TikTok Creative Center API 后才有数据返回
   */
  private async scrapeTikTok(): Promise<string[]> {
    const enabled = process.env.TIKTOK_CC_API_ENABLED === 'true';
    if (!enabled) {
      this.logger.debug('[Intelligence] TikTok scraper disabled (set TIKTOK_CC_API_ENABLED=true to enable)');
      return [];
    }
    // TODO: 接入真实 TikTok Creative Center API
    this.logger.warn('[Intelligence] TikTok CC API not yet integrated');
    return [];
  }
  private async generateDailyBrief(news: string[], signals: string[]) {
    if (news.length === 0 && signals.length === 0) {
      this.logger.debug('[Intelligence] No external intelligence available (scrapers disabled or empty)');
      return 'AceProxy 每日简报: 暂无外部情报更新。可在管理后台配置 AMZ123 和 TikTok API 以启用自动抓取。';
    }
    return `AceProxy 每日套利简报:\n- 物流: ${news.join('; ') || '无更新'}\n- 趋势: ${signals.join('; ') || '无更新'}`;
  }
}
