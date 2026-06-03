import { Injectable, Logger } from '@nestjs/common';
import { PatentRiskChecker } from './PatentRiskChecker';

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

  constructor(private readonly patentChecker: PatentRiskChecker) {}

  /**
   * AI 套利分析核心逻辑
   * 响应老板需求：粘贴链接即可秒级计算利差
   */
  async analyzeLink(url: string): Promise<ArbiBotAnalysis> {
    this.logger.log(`[ArbiBot] Analyzing link: ${url}`);

    // 1. 模拟 1688 反查 (实际对接 1688 图搜/关键词搜索 API)
    const sourcePriceCNY = 50 + Math.random() * 100; // 模拟源头价格
    const matchedSourceUrl = `https://detail.1688.com/offer/${Math.floor(Math.random() * 1000000)}.html`;

    // 2. 专利审计 (Patent Sentry)
    const patentRisk = await this.patentChecker.checkRisk("Sample Product", "General");
    
    // 3. 全包价计算 (All-in Pricing Engine)
    // 汇率假设: 1 CNY = 2200 IDR
    const EXCHANGE_RATE = 2200;
    const shippingEstimate = 15; // 假设每公斤 15 CNY
    const serviceFeePct = 0.10;  // 默认 10% 服务费
    const riskPoolPct = 0.015;   // 1.5% 风险金

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
