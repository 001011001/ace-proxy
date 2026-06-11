import { Injectable, Logger } from '@nestjs/common';

export enum UserLevel {
  EXPLORER = 'EXPLORER',
  ELITE = 'ELITE',
  GLOBAL_PARTNER = 'GLOBAL_PARTNER'
}

export interface LevelConfig {
  minSpend: number;
  serviceFeePct: number;
  rebatePct: number;
  feeDiscount: number; // Percentage discount on platform fees
  badge: string;
}

@Injectable()
export class UserLevelService {
  private readonly logger = new Logger(UserLevelService.name);

  private readonly levels: Record<UserLevel, LevelConfig> = {
    [UserLevel.EXPLORER]: { minSpend: 0, serviceFeePct: 0.10, rebatePct: 0, feeDiscount: 0, badge: '🧭' },
    [UserLevel.ELITE]: { minSpend: 50000000, serviceFeePct: 0.08, rebatePct: 0.005, feeDiscount: 20, badge: '🔥' }, // 50M IDR (~$3k)
    [UserLevel.GLOBAL_PARTNER]: { minSpend: 200000000, serviceFeePct: 0.05, rebatePct: 0.01, feeDiscount: 50, badge: '👑' }, // 200M IDR (~$12k)
  };

  /**
   * Calculate user level and config based on total spend
   */
  async calculateLevel(totalSpend: number): Promise<{ level: UserLevel; config: LevelConfig }> {
    if (totalSpend >= this.levels.GLOBAL_PARTNER.minSpend) return { level: UserLevel.GLOBAL_PARTNER, config: this.levels.GLOBAL_PARTNER };
    if (totalSpend >= this.levels.ELITE.minSpend) return { level: UserLevel.ELITE, config: this.levels.ELITE };
    return { level: UserLevel.EXPLORER, config: this.levels.EXPLORER };
  }

  /** Alias for TradeService compatibility */
  async getUserTier(totalSpend: number): Promise<{ level: UserLevel; config: LevelConfig }> {
    return this.calculateLevel(totalSpend);
  }

  /**
   * Get applicable fee discount
   */
  async getFeeDiscount(userId: string, totalSpend: number): Promise<number> {
    const { level, config } = await this.calculateLevel(totalSpend);
    this.logger.log(`[Membership] User ${userId} is at level ${level}, discount: ${config.feeDiscount}%`);
    return config.feeDiscount;
  }
}
