import { Injectable } from '@nestjs/common';

/**
 * 运费计算结果
 */
export interface ShippingQuote {
  /** 总运费 (CNY) */
  totalCostCny: number;
  /** 单价/kg (CNY) */
  unitPricePerKg: number;
  /** 处理费 (CNY) */
  handlingFee: number;
  /** 计费重量 (kg) */
  chargeableWeight: number;
  /** 时效 (天) */
  estimatedDays: string;
  /** 渠道名称 */
  channelName: string;
  /** 渠道代码 */
  channelCode: string;
  /** 币种 */
  currency: string;
  /** 是否带电渠道 */
  hasBattery: boolean;
  /** 明细 */
  breakdown: {
    weightKg: number;
    ratePerKg: number;
    weightCost: number;
    handlingCost: number;
    additionalServices: { name: string; cost: number }[];
  };
}

/**
 * 地址验证结果
 */
export interface AddressValidation {
  reachable: boolean;
  zone: string;
  message?: string;
}

/**
 * 物流渠道定义
 */
export interface ShippingChannel {
  code: string;
  name: string;
  hasBattery: boolean;
  /** 重量段定价 */
  tiers: ShippingTier[];
  /** 时效范围 */
  deliveryDays: string;
  /** 最大重量(kg) */
  maxWeightKg: number;
  /** 体积重系数 (0 = 不计抛) */
  volumetricDivisor: number;
  /** 最大尺寸限制 */
  maxDimensions: {
    maxLengthCm: number;
    maxLWHSumCm: number;
    maxSecondSideCm?: number;
  };
  /** 保价费率 */
  insuranceRate: number;
  /** 最低保价费 */
  insuranceMinFee: number;
}

/**
 * 重量段定价
 */
export interface ShippingTier {
  minWeightKg: number;
  maxWeightKg: number;
  unitPricePerKg: number;
  handlingFeePerPiece: number;
  minChargeableWeight: number;
}

/**
 * 国家运费配置
 */
export interface CountryShippingConfig {
  country: string;
  currency: string;
  exchangeRateToCny: number;
  /** 不同区域的渠道 */
  zones: Record<string, {
    label: string;
    channels: ShippingChannel[];
  }>;
}

/**
 * ShippingProvider — 物流商接口
 * 各物流商（云途/J&T/燕文）实现此接口
 */
export interface ShippingProvider {
  /** 提供商名称 */
  readonly providerName: string;

  /** 计算运费 */
  calculateQuote(params: {
    country: string;
    zone?: string;
    weightKg: number;
    hasBattery: boolean;
    itemCount: number;
    additionalServices?: string[];
  }): ShippingQuote;

  /** 批量计算（集运） */
  calculateConsolidatedQuote(params: {
    country: string;
    zone?: string;
    parcels: { weightKg: number; hasBattery: boolean }[];
    additionalServices?: string[];
  }): ShippingQuote;

  /** 验证地址是否可达 */
  validateAddress(country: string, city: string, province?: string): AddressValidation;

  /** 获取该国家所有可用渠道 */
  getAvailableChannels(country: string, zone?: string): ShippingChannel[];

  /** 估算运费（轻量级，用于列表页展示） */
  getEstimatedRange(country: string, zone?: string): { minCny: number; maxCny: number; typicalDays: string };
}
