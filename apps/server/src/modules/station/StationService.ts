import { Injectable } from '@nestjs/common';
import { HolidayPredictorService } from '../holiday/HolidayPredictorService';
import { IPFirewallService } from '../sentinel/IPFirewallService';

/**
 * StationService - 站点动态内容服务
 * 负责组装各区域（如雅加达 JKT）的首页货盘与看板数据。
 */
@Injectable()
export class StationService {
  private trendingProducts: any[] = [];

  constructor(
    private readonly holiday: HolidayPredictorService,
    private readonly sentinel: IPFirewallService
  ) {}

  /**
   * 灌入趋势爆款产品
   */
  async updateTrendingProducts(products: any[]) {
    this.trendingProducts = products;
  }

  /**
   * 动态获取站点首页配置 (支持全球多站点)
   */
  async getStationHome(stationId: string) {
    const activeCategories = await this.holiday.getActiveCategories(stationId);
    
    // 区域配置字典
    const stationConfigs: Record<string, any> = {
      'JKT': { name: 'Jakarta', region: 'IDN', currency: 'IDR', lang: 'id' },
      'LDN': { name: 'London', region: 'GBR', currency: 'GBP', lang: 'en' },
      'TYO': { name: 'Tokyo', region: 'JPN', currency: 'JPY', lang: 'ja' },
    };

    const config = stationConfigs[stationId] || stationConfigs['JKT'];

    return {
      stationName: `AceProxy ${config.name} (${stationId})`,
      regionCode: config.region,
      currency: config.currency,
      language: config.lang,
      announcement: `Global Sourcing Engine is live in ${config.name}!`,
      widgets: [
        { type: 'HOLIDAY_BANNER', title: 'Seasonal Essentials', priority: 1 },
        { type: 'TRENDING_FEEDS', title: 'Global Smart Sourcing', items: this.trendingProducts },
        { type: 'PARTNER_HUB', title: 'Join our local fulfillment network', cta: 'Apply' }
      ],
      trendingCategories: activeCategories,
      lossPreventionStatus: 'NORMAL',
    };
  }

  /**
   * 捷径：直接获取雅加达首页数据
   */
  async getJakartaHome() {
    return this.getStationHome('JKT');
  }

  /**
   * 更新产品状态
   */
  async setProductStatus(productId: string, status: 'NORMAL' | 'ARCHIVED' | 'HOT_SALE') {
    // 逻辑：更新数据库或内存状态
    console.log(`[StationService] Product ${productId} status set to ${status}`);
    return { success: true };
  }
}
