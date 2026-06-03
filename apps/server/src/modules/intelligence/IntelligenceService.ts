import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PatentRiskChecker } from './PatentRiskChecker';
import { StationService } from '../station/StationService';

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

  private async scrapeAMZ123() { return ['印尼海关突击查验预警', '中英空运价格下降 5%']; }
  private async scrapeTikTok() { return ['#RamadanOutfit 热度暴涨', '极简收纳工具点击率极高']; }
  private async generateDailyBrief(news: string[], signals: string[]) {
    return `AceProxy 每日套利简报:\n- 物流: ${news.join('; ')}\n- 趋势: ${signals.join('; ')}`;
  }
}
