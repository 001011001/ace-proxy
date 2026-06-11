import { Injectable, Logger } from '@nestjs/common';
import {
  ShippingProvider,
  ShippingQuote,
  ShippingChannel,
  AddressValidation,
} from './ShippingProvider';

/**
 * 云途物流 — 基于 2026-06-08 整合渠道最新报价
 *
 * 数据源：云途整合渠道-最新价2026-6-8.xlsx
 * 覆盖渠道：THZXR (特惠带电) / THPHR (特惠普货)
 * 覆盖国家：ID / TH / PH / SG / MY / VN
 */
@Injectable()
export class YuntuShippingProvider implements ShippingProvider {
  readonly providerName = '云途物流(YunTu)';
  private readonly logger = new Logger(YuntuShippingProvider.name);

  // ========== 印尼不可达区域 ==========
  private readonly idUnreachableProvinces: Set<string> = new Set([
    'PAPUA', 'PAPUA BARAT', 'PAPUA SELATAN', 'PAPUA TENGAH',
    'PAPUA PEGUNUNGAN', 'PAPUA BARAT DAYA', 'MALUKU', 'MALUKU UTARA',
  ]);

  // ========== Jabodetabek 区域列表 ==========
  private readonly jabodetabek: Set<string> = new Set([
    'JAKARTA', 'JAKARTA PUSAT', 'JAKARTA UTARA', 'JAKARTA BARAT',
    'JAKARTA SELATAN', 'JAKARTA TIMUR', 'BOGOR', 'DEPOK',
    'TANGERANG', 'TANGERANG SELATAN', 'BEKASI',
  ]);

  // ========== 印尼 (特惠带电 THZXR) ==========
  private readonly idCharged: ShippingChannel = {
    code: 'THZXR-ID',
    name: '云途全球专线挂号（特惠带电）',
    hasBattery: true,
    deliveryDays: '7-9 (Jabodetabek) / 12-16 (其他区域)',
    maxWeightKg: 10,
    volumetricDivisor: 0, // 不计抛
    maxDimensions: { maxLengthCm: 100, maxLWHSumCm: 240, maxSecondSideCm: 70 },
    insuranceRate: 0.007,
    insuranceMinFee: 5,
    tiers: [
      { minWeightKg: 0, maxWeightKg: 1, unitPricePerKg: 130, handlingFeePerPiece: 20, minChargeableWeight: 0.1 },
      { minWeightKg: 1, maxWeightKg: 10, unitPricePerKg: 140, handlingFeePerPiece: 50, minChargeableWeight: 0.5 },
    ],
  };

  // 印尼非Jabodetabek 价格更高
  private readonly idOtherTiers = [
    { minWeightKg: 0, maxWeightKg: 1, unitPricePerKg: 150, handlingFeePerPiece: 30, minChargeableWeight: 0.1 },
    { minWeightKg: 1, maxWeightKg: 10, unitPricePerKg: 150, handlingFeePerPiece: 60, minChargeableWeight: 0.5 },
  ];

  // ========== 泰国 (特惠带电 THZXR) ==========
  private readonly thCharged: ShippingChannel = {
    code: 'THZXR-TH',
    name: '云途全球专线挂号（特惠带电）',
    hasBattery: true,
    deliveryDays: '5-8',
    maxWeightKg: 25,
    volumetricDivisor: 5000,
    maxDimensions: { maxLengthCm: 60, maxLWHSumCm: 135, maxSecondSideCm: 40 },
    insuranceRate: 0.007,
    insuranceMinFee: 5,
    tiers: [
      { minWeightKg: 0, maxWeightKg: 25, unitPricePerKg: 58, handlingFeePerPiece: 14, minChargeableWeight: 0.1 },
    ],
  };

  // ========== 泰国 (特惠普货 THPHR) ==========
  private readonly thGeneral: ShippingChannel = {
    code: 'THPHR-TH',
    name: '云途全球专线挂号（特惠普货）',
    hasBattery: false,
    deliveryDays: '5-6',
    maxWeightKg: 25,
    volumetricDivisor: 5000,
    maxDimensions: { maxLengthCm: 60, maxLWHSumCm: 135, maxSecondSideCm: 40 },
    insuranceRate: 0.007,
    insuranceMinFee: 5,
    tiers: [
      { minWeightKg: 0, maxWeightKg: 25, unitPricePerKg: 51, handlingFeePerPiece: 8, minChargeableWeight: 0.1 },
    ],
  };

  // ========== 菲律宾 (特惠带电 THZXR) ==========
  private readonly phCharged: ShippingChannel = {
    code: 'THZXR-PH',
    name: '云途全球专线挂号（特惠带电）',
    hasBattery: true,
    deliveryDays: '8-10',
    maxWeightKg: 10,
    volumetricDivisor: 0, // 不计抛
    maxDimensions: { maxLengthCm: 100, maxLWHSumCm: 300 },
    insuranceRate: 0.007,
    insuranceMinFee: 5,
    tiers: [
      { minWeightKg: 0, maxWeightKg: 1, unitPricePerKg: 65, handlingFeePerPiece: 15, minChargeableWeight: 0.1 },
      { minWeightKg: 1, maxWeightKg: 10, unitPricePerKg: 62, handlingFeePerPiece: 50, minChargeableWeight: 0.1 },
    ],
  };

  // ========== 菲律宾 (特惠普货 THPHR) ==========
  private readonly phGeneral: ShippingChannel = {
    code: 'THPHR-PH',
    name: '云途全球专线挂号（特惠普货）',
    hasBattery: false,
    deliveryDays: '5-6',
    maxWeightKg: 10,
    volumetricDivisor: 0,
    maxDimensions: { maxLengthCm: 100, maxLWHSumCm: 300 },
    insuranceRate: 0.007,
    insuranceMinFee: 5,
    tiers: [
      { minWeightKg: 0, maxWeightKg: 1, unitPricePerKg: 44, handlingFeePerPiece: 15, minChargeableWeight: 0.1 },
      { minWeightKg: 1, maxWeightKg: 10, unitPricePerKg: 46, handlingFeePerPiece: 50, minChargeableWeight: 0.1 },
    ],
  };

  // ========== 增值服务费 ==========
  private readonly additionalServices: Record<string, number> = {
    REPACK: 4,      // 更换外包装
    COMPRESS: 2,    // 包装压缩/加固
    MERGE: 4,       // 合单
    SPLIT: 4,       // 分单
    RELABEL: 2,     // 换单
  };

  /** 重派费 */
  private readonly redeliveryFee = 60;

  // ========================================================================
  //  公共接口实现
  // ========================================================================

  calculateQuote(params: {
    country: string;
    zone?: string;
    weightKg: number;
    hasBattery: boolean;
    itemCount: number;
    additionalServices?: string[];
  }): ShippingQuote {
    const country = params.country.toUpperCase();
    const channel = this.selectChannel(country, params.zone, params.hasBattery);
    const tier = this.findTier(channel, params.weightKg);

    const chargeableWeight = Math.max(params.weightKg, tier.minChargeableWeight);
    const weightCost = chargeableWeight * tier.unitPricePerKg;
    const handlingCost = tier.handlingFeePerPiece * params.itemCount;

    const services = (params.additionalServices || []).map(s => ({
      name: s,
      cost: this.additionalServices[s] || 0,
    }));
    const serviceTotal = services.reduce((sum, s) => sum + s.cost, 0);

    const totalCostCny = weightCost + handlingCost + serviceTotal;

    return {
      totalCostCny: Math.round(totalCostCny * 100) / 100,
      unitPricePerKg: tier.unitPricePerKg,
      handlingFee: tier.handlingFeePerPiece,
      chargeableWeight: Math.round(chargeableWeight * 100) / 100,
      estimatedDays: channel.deliveryDays,
      channelName: channel.name,
      channelCode: channel.code,
      currency: 'CNY',
      hasBattery: channel.hasBattery,
      breakdown: {
        weightKg: params.weightKg,
        ratePerKg: tier.unitPricePerKg,
        weightCost: Math.round(weightCost * 100) / 100,
        handlingCost,
        additionalServices: services,
      },
    };
  }

  calculateConsolidatedQuote(params: {
    country: string;
    zone?: string;
    parcels: { weightKg: number; hasBattery: boolean }[];
    additionalServices?: string[];
  }): ShippingQuote {
    const totalWeight = params.parcels.reduce((s, p) => s + p.weightKg, 0);
    const hasAnyBattery = params.parcels.some(p => p.hasBattery);

    return this.calculateQuote({
      country: params.country,
      zone: params.zone,
      weightKg: totalWeight,
      hasBattery: hasAnyBattery,
      itemCount: params.parcels.length,
      additionalServices: params.additionalServices,
    });
  }

  validateAddress(country: string, city: string, province?: string): AddressValidation {
    const cc = country.toUpperCase();
    const cityUpper = city.toUpperCase();
    const provUpper = (province || '').toUpperCase();

    if (cc === 'ID') {
      if (this.idUnreachableProvinces.has(provUpper)) {
        return { reachable: false, zone: 'UNREACHABLE', message: '该地区暂未覆盖云途配送网络，请选择爪哇/苏门答腊/巴厘岛地址' };
      }
      const zone = this.jabodetabek.has(cityUpper) || this.jabodetabek.has(provUpper) ? 'JABODETABEK' : 'OTHER';
      return { reachable: true, zone };
    }

    if (cc === 'TH') {
      return { reachable: true, zone: 'NATIONAL' };
    }

    if (cc === 'PH') {
      return { reachable: true, zone: 'NATIONAL' };
    }

    return { reachable: false, zone: 'UNSUPPORTED', message: `云途暂不支持${country}配送` };
  }

  getAvailableChannels(country: string, _zone?: string): ShippingChannel[] {
    const cc = country.toUpperCase();
    switch (cc) {
      case 'ID': return [this.idCharged];
      case 'TH': return [this.thCharged, this.thGeneral];
      case 'PH': return [this.phCharged, this.phGeneral];
      default: return [];
    }
  }

  getEstimatedRange(country: string, zone?: string) {
    const cc = country.toUpperCase();
    const z = zone || 'JABODETABEK';

    switch (cc) {
      case 'ID': {
        if (z === 'JABODETABEK' || this.jabodetabek.has(z)) {
          return { minCny: 130 * 0.1 + 20, maxCny: 140 * 5 + 50, typicalDays: '7-9天' };
        }
        return { minCny: 150 * 0.1 + 30, maxCny: 150 * 5 + 60, typicalDays: '12-16天' };
      }
      case 'TH':
        return { minCny: 51 * 0.1 + 8, maxCny: 58 * 5 + 14, typicalDays: '5-8天' };
      case 'PH':
        return { minCny: 44 * 0.1 + 15, maxCny: 65 * 5 + 50, typicalDays: '5-10天' };
      default:
        return { minCny: 0, maxCny: 0, typicalDays: '未知' };
    }
  }

  // ========================================================================
  //  私有方法
  // ========================================================================

  private selectChannel(country: string, zone: string | undefined, hasBattery: boolean): ShippingChannel {
    const cc = country.toUpperCase();

    if (cc === 'ID') {
      const isJabodetabek = zone && this.jabodetabek.has(zone.toUpperCase());
      if (!isJabodetabek) {
        // 非Jabodetabek 使用更高价格
        return { ...this.idCharged, tiers: this.idOtherTiers, deliveryDays: '12-16 (其他区域)' };
      }
      return this.idCharged;
    }

    if (cc === 'TH') {
      return hasBattery ? this.thCharged : this.thGeneral;
    }

    if (cc === 'PH') {
      return hasBattery ? this.phCharged : this.phGeneral;
    }

    throw new Error(`云途不支持国家: ${country}`);
  }

  private findTier(channel: ShippingChannel, weightKg: number) {
    for (const tier of channel.tiers) {
      if (weightKg > tier.minWeightKg && weightKg <= tier.maxWeightKg) {
        return tier;
      }
    }
    // 超出最大重量
    const last = channel.tiers[channel.tiers.length - 1];
    throw new Error(
      `包裹重量 ${weightKg}kg 超过${channel.name}最大限重 ${channel.maxWeightKg}kg`
    );
  }
}
