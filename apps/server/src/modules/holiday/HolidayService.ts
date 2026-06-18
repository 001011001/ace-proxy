import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取指定站点的激活节日配置列表
   */
  async getHolidays(stationId: string): Promise<HolidayConfig[]> {
    this.logger.log(`[Holiday] Fetching holidays for station: ${stationId}`);
    const configs = await this.prisma.aceHolidayConfig.findMany({
      where: { stationId, isActive: true },
      orderBy: { reminderDays: 'asc' },
    });
    return configs.map((c) => ({
      stationId: c.stationId,
      festivalName: c.festivalName,
      themeId: c.themeId,
      reminderDays: c.reminderDays,
      reminderMessage: c.reminderMessage || '',
      isActive: c.isActive,
    }));
  }

  /**
   * 获取当前站点的节日配置（向后兼容）
   */
  async getConfig(stationId: string): Promise<HolidayConfig | null> {
    this.logger.log(`[Holiday] Fetching config for station: ${stationId}`);
    const config = await this.prisma.aceHolidayConfig.findFirst({
      where: { stationId, isActive: true },
      orderBy: { reminderDays: 'asc' },
    });
    if (!config) return null;
    return {
      stationId: config.stationId,
      festivalName: config.festivalName,
      themeId: config.themeId,
      reminderDays: config.reminderDays,
      reminderMessage: config.reminderMessage || '',
      isActive: config.isActive,
    };
  }

  /**
   * 更新或创建节日配置（findFirst + update/create，因 schema 无 compound unique）。
   * DTO 中包含可选的 stationId；未传时默认 'ID'。
   */
  async updateConfig(data: Partial<HolidayConfig> & { stationId?: string }) {
    const stationId = data.stationId || 'ID';
    const festivalName = data.festivalName || 'Untitled';
    const existing = await this.prisma.aceHolidayConfig.findFirst({
      where: { stationId, festivalName },
    });

    let result;
    if (existing) {
      result = await this.prisma.aceHolidayConfig.update({
        where: { id: existing.id },
        data: {
          themeId: data.themeId,
          reminderDays: data.reminderDays,
          reminderMessage: data.reminderMessage,
          isActive: data.isActive,
          updatedAt: new Date(),
        },
      });
    } else {
      result = await this.prisma.aceHolidayConfig.create({
        data: {
          stationId,
          festivalName,
          themeId: data.themeId || 'default',
          reminderDays: data.reminderDays ?? 30,
          reminderMessage: data.reminderMessage || '',
          isActive: data.isActive ?? false,
        },
      });
    }

    this.logger.log(`[Holiday] Config ${existing ? 'updated' : 'created'} for ${stationId}/${festivalName}`);
    return { success: true, current: result };
  }

  /**
   * 一键点火：激活/关闭指定站点所有节日 UI。
   * stationId 可选，未传则默认 'ID'。
   */
  async toggleActivation(active: boolean, stationId: string = 'ID') {
    const result = await this.prisma.aceHolidayConfig.updateMany({
      where: { stationId },
      data: { isActive: active, updatedAt: new Date() },
    });

    this.logger.log(
      `[Holiday] Festival UI ${active ? 'ACTIVATED' : 'DEACTIVATED'} for station ${stationId} (${result.count} configs)`,
    );
    return { success: true, isActive: active, affected: result.count };
  }
}
