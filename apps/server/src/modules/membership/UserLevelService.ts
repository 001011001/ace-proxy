import { Injectable, Logger } from '@nestjs/common';

export enum UserLevel {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM'
}

export interface LevelConfig {
  minSpend: number;
  feeDiscount: number; // Percentage discount on service fees
  badge: string;
}

@Injectable()
export class UserLevelService {
  private readonly logger = new Logger(UserLevelService.name);

  private readonly levels: Record<UserLevel, LevelConfig> = {
    [UserLevel.BRONZE]: { minSpend: 0, feeDiscount: 0, badge: '🥉' },
    [UserLevel.SILVER]: { minSpend: 10000000, feeDiscount: 5, badge: '🥈' }, // 10M IDR
    [UserLevel.GOLD]: { minSpend: 50000000, feeDiscount: 15, badge: '🥇' }, // 50M IDR
    [UserLevel.PLATINUM]: { minSpend: 200000000, feeDiscount: 30, badge: '💎' }, // 200M IDR
  };

  /**
   * Calculate user level based on total spend
   */
  async calculateLevel(totalSpend: number): Promise<{ level: UserLevel; config: LevelConfig }> {
    if (totalSpend >= this.levels.PLATINUM.minSpend) return { level: UserLevel.PLATINUM, config: this.levels.PLATINUM };
    if (totalSpend >= this.levels.GOLD.minSpend) return { level: UserLevel.GOLD, config: this.levels.GOLD };
    if (totalSpend >= this.levels.SILVER.minSpend) return { level: UserLevel.SILVER, config: this.levels.SILVER };
    return { level: UserLevel.BRONZE, config: this.levels.BRONZE };
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
