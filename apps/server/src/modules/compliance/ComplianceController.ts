import { Controller, Get, Post, Body, Query, Logger, UseGuards } from '@nestjs/common';
import { ComplianceService } from './ComplianceService';
import { CheckComplianceDto, CategoryRequirementsDto, QuickCheckDto } from '../../dto/compliance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';

@Controller('compliance')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class ComplianceController {
  private readonly logger = new Logger(ComplianceController.name);

  constructor(private readonly compliance: ComplianceService) {}

  /**
   * 全面合规检查 — 管理后台手动检查商品合规性
   */
  @Post('check')
  async checkCompliance(@Body() dto: CheckComplianceDto) {
    this.logger.log(`[Compliance] Checking: ${dto.name} → ${dto.destinationCountry}`);
    return this.compliance.checkCompliance(dto);
  }

  /**
   * 快捷检查 — 仅返回 true/false
   */
  @Post('quick-check')
  async quickCheck(@Body() dto: QuickCheckDto) {
    return this.compliance.quickCheck(dto.name, dto.category, dto.country);
  }

  /**
   * 获取品类合规要求清单 — 管理后台展示品类上架要求
   */
  @Get('category-requirements')
  async getCategoryRequirements(
    @Query('category') category: string,
    @Query('country') country: string,
  ) {
    return this.compliance.getCategoryRequirements(category, country);
  }

  /**
   * 获取所有支持的目的国法规列表
   */
  @Get('countries')
  getSupportedCountries() {
    const countries = ComplianceService.COUNTRY_REGULATIONS;
    return Object.entries(countries).map(([code, info]) => ({
      code,
      agency: info.agency,
      ruleCount: info.rules.length,
    }));
  }

  /**
   * 获取禁运品类清单
   */
  @Get('banned-categories')
  getBannedCategories() {
    return Object.entries(ComplianceService.BANNED_CATEGORIES).map(([category, items]) => ({
      category,
      items,
    }));
  }

  /**
   * 获取限制品类清单
   */
  @Get('restricted-categories')
  getRestrictedCategories() {
    return Object.entries(ComplianceService.RESTRICTED_CATEGORIES).map(([key, info]) => ({
      key,
      label: info.label,
      requiredDocs: info.requiredDocs,
    }));
  }

  /**
   * 批量合规检查 — 一次检查多个商品
   */
  @Post('batch-check')
  async batchCheck(@Body() body: { products: CheckComplianceDto[] }) {
    const results = await Promise.all(
      body.products.map(async (p) => {
        const result = await this.compliance.checkCompliance(p);
        return { product: p.name, ...result };
      }),
    );
    return results;
  }
}
