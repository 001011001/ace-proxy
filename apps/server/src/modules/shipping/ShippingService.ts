import { Injectable, Logger } from '@nestjs/common';
import { YuntuShippingProvider } from './YuntuShippingProvider';
import { ShippingQuote } from './ShippingProvider';

/**
 * ShippingService — 运费计算编排层
 *
 * 职责：
 * 1. 根据国家/重量/是否带电 自动选择最优渠道
 * 2. 叠加 AceProxy 运费差价（用户端价格）
 * 3. 集运拼单优化
 * 4. 汇率转换
 */
@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  /** 用户端运费加价系数 */
  private readonly markupRates: Record<string, { perKg: number; perPiece: number }> = {
    ID: { perKg: 40, perPiece: 10 },   // ¥130→¥170
    TH: { perKg: 17, perPiece: 6 },    // ¥58→¥75
    PH: { perKg: 20, perPiece: 7 },    // ¥65→¥85
  };

  /** 各国汇率 (CNY→当地货币) */
  private readonly exchangeRates: Record<string, number> = {
    IDR: 2200,  // 1 CNY ≈ 2200 IDR
    THB: 5.0,   // 1 CNY ≈ 5.0 THB
    PHP: 7.8,   // 1 CNY ≈ 7.8 PHP
  };

  /** 汇率差加价 */
  private readonly exchangeMarkup = 1.03;

  constructor(private readonly yuntu: YuntuShippingProvider) {}

  /**
   * 获取成本运费（云途真实价）
   */
  getCostQuote(params: {
    country: string;
    zone?: string;
    weightKg: number;
    hasBattery: boolean;
    itemCount: number;
  }): ShippingQuote {
    return this.yuntu.calculateQuote(params);
  }

  /**
   * 获取用户端运费（含差价 + 汇率转换）
   */
  getUserQuote(params: {
    country: string;
    zone?: string;
    weightKg: number;
    hasBattery: boolean;
    itemCount: number;
    currency?: string;
  }): {
    costCny: number;
    userPrice: number;
    userCurrency: string;
    markupCny: number;
    breakdown: ShippingQuote['breakdown'];
    estimatedDays: string;
    channelName: string;
  } {
    const costQuote = this.yuntu.calculateQuote(params);
    const markup = this.markupRates[params.country.toUpperCase()] || { perKg: 15, perPiece: 5 };

    const markupPerKg = markup.perKg * costQuote.chargeableWeight;
    const markupPerPiece = markup.perPiece * params.itemCount;
    const userPriceCny = costQuote.totalCostCny + markupPerKg + markupPerPiece;

    const currency = params.currency || this.getDefaultCurrency(params.country);
    const rate = (this.exchangeRates[currency] || 2200) * this.exchangeMarkup;
    const userPriceLocal = Math.round(userPriceCny * rate);

    return {
      costCny: costQuote.totalCostCny,
      userPrice: userPriceLocal,
      userCurrency: currency,
      markupCny: markupPerKg + markupPerPiece,
      breakdown: costQuote.breakdown,
      estimatedDays: costQuote.estimatedDays,
      channelName: costQuote.channelName,
    };
  }

  /**
   * 集运报价（多件合并）
   */
  getConsolidatedUserQuote(params: {
    country: string;
    zone?: string;
    parcels: { weightKg: number; hasBattery: boolean }[];
    currency?: string;
  }) {
    const costQuote = this.yuntu.calculateConsolidatedQuote(params);
    const markup = this.markupRates[params.country.toUpperCase()] || { perKg: 15, perPiece: 5 };

    const markupTotal = markup.perKg * costQuote.chargeableWeight + markup.perPiece * params.parcels.length;
    const userPriceCny = costQuote.totalCostCny + markupTotal;

    const currency = params.currency || this.getDefaultCurrency(params.country);
    const rate = (this.exchangeRates[currency] || 2200) * this.exchangeMarkup;
    const userPriceLocal = Math.round(userPriceCny * rate);

    return {
      costCny: costQuote.totalCostCny,
      userPrice: userPriceLocal,
      userCurrency: currency,
      parcelCount: params.parcels.length,
      totalWeightKg: costQuote.chargeableWeight,
      estimatedDays: costQuote.estimatedDays,
      channelName: costQuote.channelName,
    };
  }

  /**
   * 验证地址可达性
   */
  validateAddress(country: string, city: string, province?: string) {
    return this.yuntu.validateAddress(country, city, province);
  }

  /**
   * 获取预估运费区间（用于列表页展示）
   */
  getEstimateRange(country: string, zone?: string) {
    const range = this.yuntu.getEstimatedRange(country, zone);
    const currency = this.getDefaultCurrency(country);
    const rate = (this.exchangeRates[currency] || 2200) * this.exchangeMarkup;

    return {
      ...range,
      minLocal: Math.round(range.minCny * rate),
      maxLocal: Math.round(range.maxCny * rate),
      currency,
    };
  }

  private getDefaultCurrency(country: string): string {
    const c = country.toUpperCase();
    if (c === 'ID') return 'IDR';
    if (c === 'TH') return 'THB';
    if (c === 'PH') return 'PHP';
    return 'USD';
  }
}
