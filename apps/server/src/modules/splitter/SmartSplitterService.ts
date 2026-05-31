import { Injectable, Logger } from '@nestjs/common';

export enum ItemCategory {
  GENERAL = 'GENERAL',     // 普通货物
  SENSITIVE = 'SENSITIVE', // 敏感货 (液体、电池、品牌等)
  HIGH_VALUE = 'HIGH_VALUE' // 高价值货
}

/**
 * SmartSplitterService - 智能拆单引擎
 * 核心逻辑：根据 HS Code 和商品属性自动拆单，确保清关合规并最大化利润。
 */
@Injectable()
export class SmartSplitterService {
  private readonly logger = new Logger(SmartSplitterService.name);

  /**
   * 执行拆单逻辑
   * @param items 订单项列表
   * @param destination 目的地 (JKT/LDN)
   */
  async splitOrder(items: any[], destination: string) {
    const parcels = {
      [ItemCategory.GENERAL]: [],
      [ItemCategory.SENSITIVE]: [],
      [ItemCategory.HIGH_VALUE]: [],
    };

    for (const item of items) {
      const category = this.categorizeByHSCode(item.hsCode);
      parcels[category].push(item);
    }

    this.logger.log(`Order split into ${Object.keys(parcels).filter(k => parcels[k].length > 0).length} parcels for ${destination}`);
    
    return {
      destination,
      timestamp: new Date(),
      parcels: Object.entries(parcels)
        .filter(([_, content]) => content.length > 0)
        .map(([type, content]) => ({
          type,
          content,
          suggestedRoute: this.getRouteRecommendation(type, destination),
        })),
    };
  }

  private categorizeByHSCode(hsCode: string): ItemCategory {
    // 模拟 HS Code 映射逻辑
    if (['8501', '8507'].some(prefix => hsCode.startsWith(prefix))) return ItemCategory.SENSITIVE; // 电池/电机
    if (['7113'].some(prefix => hsCode.startsWith(prefix))) return ItemCategory.HIGH_VALUE;    // 珠宝
    return ItemCategory.GENERAL;
  }

  private getRouteRecommendation(type: string, destination: string) {
    const routes = {
      'JKT': {
        [ItemCategory.GENERAL]: '海运大包 (ID-SEA-GEN)',
        [ItemCategory.SENSITIVE]: '特货空运 (ID-AIR-SENS)',
        [ItemCategory.HIGH_VALUE]: '特货空运 (ID-AIR-SENS)',
      },
      'LDN': {
        [ItemCategory.GENERAL]: '中英铁运 (UK-RAIL-GEN)',
        [ItemCategory.SENSITIVE]: '中英空运 (UK-AIR-SENS)',
        [ItemCategory.HIGH_VALUE]: '中英空运 (UK-AIR-SENS)',
      }
    };

    return routes[destination]?.[type] || '标准国际快递';
  }
}
