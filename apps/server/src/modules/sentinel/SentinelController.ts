import { Controller, Post, Get, Body, Logger, UseGuards } from '@nestjs/common';
import { IPFirewallService } from './IPFirewallService';
import { EvaluateRiskDto } from '../../dto/sentinel.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';

@Controller('sentinel')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class SentinelController {
  private readonly logger = new Logger(SentinelController.name);

  constructor(private readonly sentinel: IPFirewallService) {}

  /**
   * 单品风险评估 — 品牌 Logo 检测 + 外观专利相似度比对
   */
  @Post('evaluate-risk')
  async evaluateRisk(@Body() dto: EvaluateRiskDto) {
    this.logger.log(`[Sentinel] Evaluating risk for ${dto.imageUrl}`);
    return this.sentinel.evaluateRisk(dto.imageUrl);
  }

  /**
   * 批量风险评估
   */
  @Post('batch-evaluate')
  async batchEvaluate(@Body() body: { imageUrls: string[] }) {
    const results = await Promise.all(
      body.imageUrls.map(async (url) => ({
        imageUrl: url,
        ...(await this.sentinel.evaluateRisk(url)),
      })),
    );
    return results;
  }

  /**
   * 获取被监控的品牌清单
   */
  @Get('brands')
  getMonitoredBrands() {
    return IPFirewallService['BRAND_PATTERNS'];
  }
}
