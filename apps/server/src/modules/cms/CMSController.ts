import { Controller, Post, Get, Body, Logger, UseGuards } from '@nestjs/common';
import { CMSService } from './CMSService';
import { BulkPublishDto, PromoteToHeroFromTrendingDto } from '../../dto/cms.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';

@Controller('cms')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class CMSController {
  private readonly logger = new Logger(CMSController.name);

  constructor(private readonly cms: CMSService) {}

  /**
   * 获取所有爆款产品
   */
  @Get('hero-products')
  async getHeroProducts() {
    return this.cms.getHeroProducts();
  }

  /**
   * 批量发布爆款商品
   */
  @Post('publish')
  async bulkPublish(@Body() dto: BulkPublishDto) {
    this.logger.log(`[CMS] Bulk publishing ${dto.products.length} products`);
    return this.cms.bulkPublishProducts(dto.products);
  }

  /**
   * 从 Trending 引擎一键推广为爆款
   */
  @Post('promote-from-trending')
  async promoteFromTrending(@Body() dto: PromoteToHeroFromTrendingDto) {
    this.logger.log(`[CMS] Promoting ${dto.productName} to Hero`);
    return this.cms.bulkPublishProducts([{
      name: dto.productName,
      category: dto.category,
      sourcePriceCNY: dto.sourcePriceCNY,
      targetPriceIDR: dto.targetPriceIDR,
      marginPct: dto.marginPct,
      imageUrl: dto.imageUrl || `https://placehold.co/400x400/F97316/FFFFFF?text=${encodeURIComponent(dto.productName.substring(0, 10))}`,
    }]);
  }
}
