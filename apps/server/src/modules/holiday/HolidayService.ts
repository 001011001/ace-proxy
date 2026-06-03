import { Injectable, Logger } from '@nestjs/common';

export interface HolidayConfig {
  stationId: string;
  festivalName: string;
  themeId: string;
  reminderDays: number;
  reminderMessage: string;
  isActive: boolean;
}

@Injectable()
export class HolidayService {
  private readonly logger = new Logger(HolidayService.name);
  
  // 模拟数据库存储
  private config: HolidayConfig = {
    stationId: 'ID',
    festivalName: 'Eid 2026',
    themeId: 'NEO_BRUTALISM_V1',
    reminderDays: 30,
    reminderMessage: '⚠️ 备货提醒: 距离开斋节仅剩 30 天，请提前锁货避免延误！',
    isActive: true,
  };

  /**
   * 获取当前站点的节日配置
   */
  async getConfig(stationId: string): Promise<HolidayConfig> {
    this.logger.log(`[Holiday] Fetching config for station: ${stationId}`);
    return this.config;
  }

  /**
   * 更新节日配置 (老板在后台操作)
   */
  async updateConfig(newConfig: Partial<HolidayConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.logger.log(`[Holiday] Config updated by Admin: ${JSON.stringify(this.config)}`);
    return { success: true, current: this.config };
  }

  /**
   * 一键点火：激活/关闭节日 UI
   */
  async toggleActivation(active: boolean) {
    this.config.isActive = active;
    this.logger.log(`[Holiday] Festival UI ${active ? 'ACTIVATED' : 'DEACTIVATED'} by Admin.`);
    return { success: true, isActive: active };
  }
}
