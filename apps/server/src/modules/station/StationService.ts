import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HolidayPredictorService } from '../holiday/HolidayPredictorService';
import { IPFirewallService } from '../sentinel/IPFirewallService';
import { StationAdminService } from './StationAdminService';

@Injectable()
export class StationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly holiday: HolidayPredictorService,
    private readonly sentinel: IPFirewallService,
    private readonly stationAdmin: StationAdminService,
  ) {}

  async getStationHome(stationId: string) {
    const activeCategories = await this.holiday.getActiveCategories(stationId);

    // Fetch real products from DB
    const products = await this.prisma.aceHeroProduct.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { arbitrageGapPct: 'desc' },
    });

    // Dynamic lookup from DB, fallback to defaults
    const config = await this.stationAdmin.getByCode(stationId);

    // Fetch active holiday for this station
    const holiday = await this.prisma.aceHolidayConfig.findFirst({
      where: { stationId, isActive: true },
    });

    return {
      stationName: `AceProxy ${config.name} (${stationId})`,
      regionCode: config.region,
      currency: config.currency,
      language: config.language,
      timezone: config.timezone,
      activeHoliday: holiday || null,
      announcement: `Global Sourcing Engine is live in ${config.name}!`,
      products,
      trendingCategories: activeCategories,
      lossPreventionStatus: 'NORMAL',
    };
  }

  async getJakartaHome() {
    return this.getStationHome('JKT');
  }

  /** @deprecated Kept for backward compatibility with SentinelScraper */
  async updateTrendingProducts(products: any[]) {
    return { success: true };
  }

  /** @deprecated Kept for backward compatibility with IntelligenceService */
  async setProductStatus(productId: string, status: string) {
    return { success: true };
  }
}
