import { Injectable, Logger } from '@nestjs/common';
import { YuntuShippingProvider } from './YuntuShippingProvider';
import { ShippingQuote } from './ShippingProvider';
import {
  getExchangeRate,
  getShippingMarkup,
  getDefaultCurrency,
  EXCHANGE_MARKUP,
} from '../../common/exchange-rate';

/**
 * ShippingService — 运费计算编排层
 *
 * 职责：
 * 1. 根据国家/重量/是否带电 自动选择最优渠道
 * 2. 叠加 AceProxy 运费差价（用户端价格）
 * 3. 集运拼单优化
 * 4. 汇率转换（从各国 config.ts 集中读取）
 */
@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

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
    const markup = getShippingMarkup(params.country);

    const markupPerKg = markup.perKg * costQuote.chargeableWeight;
    const markupPerPiece = markup.perPiece * params.itemCount;
    const userPriceCny = costQuote.totalCostCny + markupPerKg + markupPerPiece;

    const currency = params.currency || getDefaultCurrency(params.country);
    const rate = getExchangeRate(params.country) * EXCHANGE_MARKUP;
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
    const markup = getShippingMarkup(params.country);

    const markupTotal = markup.perKg * costQuote.chargeableWeight + markup.perPiece * params.parcels.length;
    const userPriceCny = costQuote.totalCostCny + markupTotal;

    const currency = params.currency || getDefaultCurrency(params.country);
    const rate = getExchangeRate(params.country) * EXCHANGE_MARKUP;
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
    const currency = getDefaultCurrency(country);
    const rate = getExchangeRate(country) * EXCHANGE_MARKUP;

    return {
      ...range,
      minLocal: Math.round(range.minCny * rate),
      maxLocal: Math.round(range.maxCny * rate),
      currency,
    };
  }
}
