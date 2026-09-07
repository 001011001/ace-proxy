import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { YuntuShippingProvider } from './YuntuShippingProvider';
import { ShippingQuote } from './ShippingProvider';

export interface CarrierQuote {
  carrier: string;
  channelName: string;
  totalCostCny: number;
  estimatedDays: number;
  hasTracking: boolean;
}

@Injectable()
export class MultiCarrierService {
  private readonly logger = new Logger(MultiCarrierService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly yuntu: YuntuShippingProvider,
    private readonly config: ConfigService,
  ) {}

  /** 获取所有支持渠道的报价 */
  async getAllQuotes(params: {
    country: string; weightKg: number; hasBattery: boolean; itemCount: number;
  }): Promise<CarrierQuote[]> {
    const quotes: CarrierQuote[] = [];

    // 1. 云途 (已接入)
    try {
      const yq = this.yuntu.calculateQuote(params);
      quotes.push({
        carrier: 'YUNTU', channelName: yq.channelName,
        totalCostCny: yq.totalCostCny, estimatedDays: parseInt(yq.estimatedDays) || 7,
        hasTracking: true,
      });
    } catch (e: any) {
      this.logger.warn(`[Carrier] YUNTU failed: ${e.message}`);
    }

    // 2. J&T Express Indonesia
    try {
      const jntq = await this.getJntQuote(params);
      if (jntq) quotes.push(jntq);
    } catch (e: any) {
      this.logger.warn(`[Carrier] JNT failed: ${e.message}`);
    }

    // 3. JNE
    try {
      const jneq = await this.getJneQuote(params);
      if (jneq) quotes.push(jneq);
    } catch (e: any) {
      this.logger.warn(`[Carrier] JNE failed: ${e.message}`);
    }

    // 4. 菜鸟 (Cainiao)
    try {
      const cnq = await this.getCainiaoQuote(params);
      if (cnq) quotes.push(cnq);
    } catch (e: any) {
      this.logger.warn(`[Carrier] Cainiao failed: ${e.message}`);
    }

    const sorted = quotes.sort((a, b) => a.totalCostCny - b.totalCostCny);
    this.logger.log(`[Carrier] ${params.country} ${params.weightKg}kg: ${sorted.length} carriers (best: ${sorted[0]?.carrier} ¥${sorted[0]?.totalCostCny})`);

    return sorted;
  }

  /** 获取最优渠道 */
  async getBestQuote(params: {
    country: string; weightKg: number; hasBattery: boolean; itemCount: number;
  }): Promise<CarrierQuote | null> {
    const quotes = await this.getAllQuotes(params);
    return quotes[0] || null;
  }

  /** 从缓存/DB 获取运费表 */
  async getCachedRates(carrier: string, destCountry: string) {
    return this.prisma.aceShippingRate.findMany({
      where: { carrier, destCountry, isActive: true },
      orderBy: { weightRangeMin: 'asc' },
    });
  }

  /** 刷新运费表 */
  async refreshRates(carrier: string, destCountry: string) {
    this.logger.log(`[Carrier] Refreshing ${carrier} rates for ${destCountry}`);

    // 此处接入各物流商 API 获取真实费率，写入 ace_shipping_rates
    // 目前用内置费率表
    const rates = this.getBuiltInRates(carrier, destCountry);
    for (const r of rates) {
      await this.prisma.aceShippingRate.upsert({
        where: { id: `${carrier}_${destCountry}_${r.weightRangeMin}` },
        update: r,
        create: { 
          id: `${carrier}_${destCountry}_${r.weightRangeMin}`, 
          carrier, 
          destCountry, 
          originCountry: 'CN', // Added missing required property
          ...r 
        },
      });
    }
    return { success: true, carrier, destCountry, count: rates.length };
  }

  // ─── 各物流商报价 ───

  private async getJntQuote(params: { country: string; weightKg: number; hasBattery: boolean }): Promise<CarrierQuote | null> {
    if (!['ID'].includes(params.country)) return null;
    const rates = await this.getCachedRates('JNT', params.country);
    if (rates.length > 0) {
      const matched = rates.find(r => params.weightKg >= Number(r.weightRangeMin) && params.weightKg <= Number(r.weightRangeMax));
      if (matched) {
        const cost = Number(matched.baseRateCny) + (params.weightKg - 1) * Number(matched.perKgRateCny || 0) + (params.hasBattery ? Number(matched.batteryFeeCny || 0) : 0);
        return { carrier: 'JNT', channelName: 'J&T Express', totalCostCny: Math.max(0, cost), estimatedDays: matched.estimatedDays, hasTracking: true };
      }
    }
    // 内置费率: Indonesia, 首重¥35, 续重¥18/kg
    const baseRate = 35, perKg = 18;
    return {
      carrier: 'JNT',
      channelName: 'J&T Express',
      totalCostCny: baseRate + (params.weightKg > 1 ? (params.weightKg - 1) * perKg : 0) + (params.hasBattery ? 10 : 0),
      estimatedDays: 5,
      hasTracking: true,
    };
  }

  private async getJneQuote(params: { country: string; weightKg: number; hasBattery: boolean }): Promise<CarrierQuote | null> {
    if (!['ID'].includes(params.country)) return null;
    const baseRate = 30, perKg = 15;
    return {
      carrier: 'JNE',
      channelName: 'JNE REG',
      totalCostCny: baseRate + (params.weightKg > 1 ? (params.weightKg - 1) * perKg : 0) + (params.hasBattery ? 8 : 0),
      estimatedDays: 7,
      hasTracking: true,
    };
  }

  private async getCainiaoQuote(params: { country: string; weightKg: number; hasBattery: boolean }): Promise<CarrierQuote | null> {
    const baseRate = params.country === 'ID' ? 28 : 45;
    const perKg = params.country === 'ID' ? 12 : 20;
    return {
      carrier: 'CAINIAO',
      channelName: 'Cainiao Standard',
      totalCostCny: baseRate + (params.weightKg > 1 ? (params.weightKg - 1) * perKg : 0) + (params.hasBattery ? 15 : 0),
      estimatedDays: params.country === 'ID' ? 5 : 10,
      hasTracking: true,
    };
  }

  private getBuiltInRates(carrier: string, country: string) {
    const id = `${carrier}_${country}`;
    return [
      { weightRangeMin: 0, weightRangeMax: 0.5, baseRateCny: 25, perKgRateCny: 0, batteryFeeCny: 8, estimatedDays: 7, channelName: `${carrier} Express`, isActive: true, id: `${id}_0` },
      { weightRangeMin: 0.5, weightRangeMax: 1, baseRateCny: 35, perKgRateCny: 0, batteryFeeCny: 10, estimatedDays: 5, channelName: `${carrier} Express`, isActive: true, id: `${id}_0.5` },
      { weightRangeMin: 1, weightRangeMax: 5, baseRateCny: 35, perKgRateCny: 18, batteryFeeCny: 12, estimatedDays: 5, channelName: `${carrier} Express`, isActive: true, id: `${id}_1` },
      { weightRangeMin: 5, weightRangeMax: 100, baseRateCny: 100, perKgRateCny: 15, batteryFeeCny: 15, estimatedDays: 5, channelName: `${carrier} Express`, isActive: true, id: `${id}_5` },
    ];
  }
}
