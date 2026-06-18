import { Injectable, Logger } from '@nestjs/common';
import { ID_CONFIG } from '../../countries/id/config';
import { TH_CONFIG } from '../../countries/th/config';
import { PH_CONFIG } from '../../countries/ph/config';

/**
 * 国家区域配置片段（仅暴露 RegionService 需要的字段）。
 */
interface CountryRegionInfo {
  country: string;
  region: {
    riskLevel: string;
    chargebackRate: number;
    isAdEnabled: boolean;
  };
}

/**
 * 从各国 config 提取区域配置。
 * 新增国家时只需在此注册。
 */
const REGION_CONFIGS: Record<string, CountryRegionInfo> = {
  JKT: {
    country: 'ID',
    region: {
      riskLevel: (ID_CONFIG as any).region?.riskLevel || 'LOW',
      chargebackRate: (ID_CONFIG as any).region?.chargebackRate || 0.01,
      isAdEnabled: (ID_CONFIG as any).region?.isAdEnabled ?? true,
    },
  },
  TH: {
    country: 'TH',
    region: {
      riskLevel: (TH_CONFIG as any).region?.riskLevel || 'LOW',
      chargebackRate: (TH_CONFIG as any).region?.chargebackRate || 0.005,
      isAdEnabled: (TH_CONFIG as any).region?.isAdEnabled ?? true,
    },
  },
  PH: {
    country: 'PH',
    region: {
      riskLevel: (PH_CONFIG as any).region?.riskLevel || 'NORMAL',
      chargebackRate: (PH_CONFIG as any).region?.chargebackRate || 0.02,
      isAdEnabled: (PH_CONFIG as any).region?.isAdEnabled ?? true,
    },
  },
};

/**
 * RegionService - 区域逻辑与状态管理
 *
 * 原为内存 Map 存储，现已改为从 countries/{id,th,ph}/config.ts 读取区域配置。
 * 如需运行时热更新，后续可接入 Prisma 持久化。
 *
 * @todo P2 — 增加 AceRegionConfig 数据库表，支持后台动态修改区域参数
 */
@Injectable()
export class RegionService {
  private readonly logger = new Logger(RegionService.name);

  // 运行时覆盖（内存 patch，重启后丢失）
  private patches: Record<string, Partial<CountryRegionInfo['region']>> = {};

  /**
   * 获取指定区域配置。
   */
  async getSettings(regionId: string) {
    const base = REGION_CONFIGS[regionId]?.region || {
      riskLevel: 'NORMAL',
      chargebackRate: 0.02,
      isAdEnabled: true,
    };
    const patch = this.patches[regionId] || {};
    return { ...base, ...patch };
  }

  /**
   * 运行时更新区域配置（内存 patch，重启后恢复为 countries config 默认值）。
   *
   * @todo P2 — 接入数据库持久化
   */
  async updateSettings(regionId: string, patch: Record<string, any>) {
    this.patches[regionId] = { ...(this.patches[regionId] || {}), ...patch };
    this.logger.warn(
      `[Region] ${regionId} settings patched (MEMORY-ONLY): ${JSON.stringify(patch)}. ` +
      'Restart will reset to config defaults.',
    );
    return { success: true, current: await this.getSettings(regionId) };
  }

  /**
   * 获取指定区域的拒付率，供熔断器审计。
   */
  async getChargebackRate(regionId: string): Promise<number> {
    const settings = await this.getSettings(regionId);
    return settings.chargebackRate || 0;
  }
}
