import { Injectable, Logger } from '@nestjs/common';
import { PatentRiskChecker } from './PatentRiskChecker';
import { ConfigurationError, isDevMockEnabled } from '../../common/ConfigurationError';
import { Alibaba1688Service } from './Alibaba1688Service';
import { UnifiedSourcingService } from './UnifiedSourcingService';

export interface ArbiBotAnalysis {
  sourceUrl: string;
  matchedSourceUrl: string;
  sourcePriceCNY: number;
  allInPriceIDR: number;
  arbitrageGapPct: number;
  riskStatus: 'CLEAN' | 'WARNING' | 'BLOCKED';
  riskReason?: string;
  breakdown: {
    sourceCost: number;
    shippingEstimate: number;
    serviceFee: number;
    riskPool: number;
  };
}

@Injectable()
export class ArbiBotService {
  private readonly logger = new Logger(ArbiBotService.name);

  constructor(
    private readonly patentChecker: PatentRiskChecker,
    private readonly alibaba1688: Alibaba1688Service,
    private readonly unifiedSourcing: UnifiedSourcingService,
  ) {}

  /**
   * AI 套利分析 — 使用 UnifiedSourcingService 搜索真实 1688/京东/淘宝 价格
   *
   * @todo P2 — DEV_MOCK 分支返回模拟价格数据，需要接入真实 1688/Taobao/JD API 并移除 fallback
   */
  async analyzeLink(url: string): Promise<ArbiBotAnalysis> {
    this.logger.log(`[ArbiBot] Analyzing link: ${url}`);

    // 1. 搜索三平台同款
    let sourcePriceCNY = 0;
    let matchedSourceUrl = '';
    try {
      const results = await this.unifiedSourcing.searchAll(url, 3);
      if (results.length > 0) {
        sourcePriceCNY = results[0].priceCny;
        matchedSourceUrl = results[0].sourceUrl;
      }
    } catch (e) {
      this.logger.warn(`[ArbiBot] Sourcing failed: ${e}`);
    }

    // 真实数据不可得时 → 抛错而非随机数
    if (sourcePriceCNY === 0 && !isDevMockEnabled()) {
      throw new ConfigurationError('ArbiBot/1688', ['ALIBABA_APP_KEY', 'ALIBABA_APP_SECRET']);
    }
    if (sourcePriceCNY === 0) {
      this.logger.warn('[MOCK] ArbiBotService.analyzeLink — 使用模拟价格，需接入真实1688/淘宝/JD API');
      sourcePriceCNY = 50 + Math.random() * 100;
      matchedSourceUrl = 'https://detail.1688.com/offer/mock';
      this.logger.warn('[ArbiBot] DEV_MOCK: using simulated price');
    }

    // 2. 专利审计 (Patent Sentry)
    const patentRisk = await this.patentChecker.checkRisk("Sample Product", "General");
    
    // 3. 全包价计算 (All-in Pricing Engine) — 已接入云途物流真实定价
    // 汇率: 1 CNY ≈ 2200 IDR
    const EXCHANGE_RATE = 2200;
    // 云途印尼特惠带电 0.5kg: (0.5×130)+20 = ¥85 (Jabodetabek) / (0.5×150)+30 = ¥105 (其他)
    // 取中值 ¥95 作为估算基准
    const shippingEstimate = 95;
    const serviceFeePct = 0.10;
    const riskPoolPct = 0.015;

    const sourceCost = sourcePriceCNY;
    const serviceFee = sourceCost * serviceFeePct;
    const riskPool = sourceCost * riskPoolPct;
    
    const totalCNY = sourceCost + shippingEstimate + serviceFee + riskPool;
    const allInPriceIDR = totalCNY * EXCHANGE_RATE;

    // 4. 利差计算 (假设海外同款售价为全包价的 234%)
    const marketPriceIDR = allInPriceIDR * 2.34;
    const arbitrageGapPct = (marketPriceIDR - allInPriceIDR) / allInPriceIDR;

    return {
      sourceUrl: url,
      matchedSourceUrl,
      sourcePriceCNY,
      allInPriceIDR,
      arbitrageGapPct,
      riskStatus: patentRisk.isHighRisk ? 'BLOCKED' : 'CLEAN',
      riskReason: patentRisk.reason,
      breakdown: {
        sourceCost,
        shippingEstimate,
        serviceFee,
        riskPool
      }
    };
  }
}
