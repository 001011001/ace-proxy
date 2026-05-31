import { Injectable } from '@nestjs/common';
import { HolidayPredictorService } from '../holiday/HolidayPredictorService';
import { IPFirewallService } from '../sentinel/IPFirewallService';

/**
 * StationService - 站点动态内容服务
 * 负责组装各区域（如雅加达 JKT）的首页货盘与看板数据。
 */
@Injectable()
export class StationService {
  constructor(
    private readonly holiday: HolidayPredictorService,
    private readonly sentinel: IPFirewallService
  ) {}

  /**
   * 获取雅加达站点首页配置
   */
  async getJakartaHome() {
    const activeCategories = await this.holiday.getActiveCategories('JKT');
    
    return {
      stationName: 'AceProxy Jakarta (JKT)',
      regionCode: 'IDN',
      currency: 'IDR',
      announcement: '🏮 开斋节备货季开启！1688 原厂货源利差高达 200%。',
      widgets: [
        { type: 'HOLIDAY_BANNER', title: 'Ramadan Essentials', priority: 1 },
        { type: 'ARBI_BOT_COMPARE', title: 'Amazon vs AceProxy 套利对冲', items: [] },
        { type: 'PARTNER_HUB', title: '成为团长/骑手，收割邻里红利', cta: 'Join Now' }
      ],
      trendingCategories: activeCategories,
      lossPreventionStatus: 'NORMAL',
    };
  }
}
