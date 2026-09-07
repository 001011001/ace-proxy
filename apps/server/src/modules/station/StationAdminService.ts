import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StationAdminService {
  private readonly logger = new Logger(StationAdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** 获取所有站点 */
  async list() {
    return this.prisma.aceStation.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  /** 按 code 获取站点 */
  async getByCode(code: string) {
    const station = await this.prisma.aceStation.findUnique({ where: { code } });
    if (!station) {
      // fallback to hardcoded defaults for backward compatibility
      return this.getDefaultStation(code);
    }
    return station;
  }

  /** 创建站点 */
  async create(data: {
    code: string; name: string; region: string;
    currency?: string; language?: string; timezone?: string; domain?: string;
  }) {
    const station = await this.prisma.aceStation.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        region: data.region.toUpperCase(),
        currency: data.currency || 'IDR',
        language: data.language || 'id',
        timezone: data.timezone || 'Asia/Jakarta',
        domain: data.domain || null,
        status: 'ACTIVE',
        sortOrder: await this.prisma.aceStation.count(),
      },
    });
    this.logger.log(`[Station] Created: ${station.code} - ${station.name}`);
    return station;
  }

  /** 更新站点 */
  async update(code: string, data: {
    name?: string; currency?: string; language?: string;
    timezone?: string; domain?: string; status?: string; sortOrder?: number;
  }) {
    const station = await this.prisma.aceStation.findUnique({ where: { code } });
    if (!station) throw new NotFoundException(`Station ${code} not found`);

    return this.prisma.aceStation.update({
      where: { code },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /** 删除站点 (软删除) */
  async deactivate(code: string) {
    return this.prisma.aceStation.update({
      where: { code },
      data: { status: 'INACTIVE' },
    });
  }

  /** 获取站点统计（各站 GMV/订单数） */
  async getStationStats() {
    const stations = await this.list();
    const stats = await Promise.all(
      stations.map(async (s) => {
        const orders = await this.prisma.aceOrder.count({
          where: { country: s.region, status: { not: 'CANCELLED' } },
        });
        const gmvResult = await this.prisma.aceOrder.aggregate({
          _sum: { totalAmount: true },
          where: { country: s.region, status: { not: 'CANCELLED' } },
        });
        return {
          code: s.code,
          name: s.name,
          status: s.status,
          orders,
          gmv: Math.round(Number(gmvResult._sum.totalAmount || 0)),
        };
      }),
    );
    return stats;
  }

  /** 默认站点（fallback） */
  private getDefaultStation(code: string) {
    const defaults: Record<string, any> = {
      JKT: { code: 'JKT', name: 'Jakarta', region: 'IDN', currency: 'IDR', language: 'id', timezone: 'Asia/Jakarta' },
      LDN: { code: 'LDN', name: 'London', region: 'GBR', currency: 'GBP', language: 'en', timezone: 'Europe/London' },
      TYO: { code: 'TYO', name: 'Tokyo', region: 'JPN', currency: 'JPY', language: 'ja', timezone: 'Asia/Tokyo' },
    };
    return defaults[code] || defaults['JKT'];
  }
}
