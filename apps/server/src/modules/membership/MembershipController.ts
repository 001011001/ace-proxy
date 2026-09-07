import { Controller, Post, Get, Body, Param, Logger, UseGuards } from '@nestjs/common';
import { UserLevelService } from './UserLevelService';
import { CalculateLevelDto, GetFeeDiscountDto } from '../../dto/membership.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';

@Controller('membership')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class MembershipController {
  private readonly logger = new Logger(MembershipController.name);

  constructor(private readonly membership: UserLevelService) {}

  /**
   * 计算用户等级（基于累计消费）
   */
  @Post('calculate-level')
  async calculateLevel(@Body() dto: CalculateLevelDto) {
    return this.membership.calculateLevel(dto.totalSpend);
  }

  /**
   * 获取用户费用折扣
   */
  @Post('fee-discount')
  async getFeeDiscount(@Body() dto: GetFeeDiscountDto) {
    return { discountPct: await this.membership.getFeeDiscount(dto.userId, dto.totalSpend) };
  }

  /**
   * 获取所有等级配置 — 管理后台展示
   */
  @Get('levels')
  getLevels() {
    // 通过反射获取 levels 配置
    const levels = this.membership['levels'];
    return Object.entries(levels).map(([level, config]) => ({
      level,
      ...config,
    }));
  }
}
