import { Controller, Post, Body, Logger, UseGuards } from '@nestjs/common';
import { ArbiBotService } from './ArbiBotService';
import { TrendingEngine } from '../trending-engine/TrendingEngine';
import { CMSService } from '../cms/CMSService';
import { ProductService } from '../product/ProductService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';
import { AnalyzeLinkDto } from '../../dto/arbibot.dto';
import {
  AnalyzeBatchDto,
  ScanAndListDto,
  ScanTrendingDto,
  PromoteToHeroDto,
} from '../../dto/arbibot-batch.dto';

@Controller('arbibot')
export class ArbiBotController {
  private readonly logger = new Logger(ArbiBotController.name);

  constructor(
    private readonly arbiBotService: ArbiBotService,
    private readonly trending: TrendingEngine,
    private readonly cms: CMSService,
    private readonly productService: ProductService,
  ) {}

  /**
   * 单品利差分析 — 公开端点（无需登录）
   * 用户粘贴链接即可比价，限流防止滥用
   */
  @UseGuards(ThrottlerGuard)
  @Post('analyze')
  async analyze(@Body() body: AnalyzeLinkDto) {
    this.logger.log(`[ArbiBot] Public analysis request for: ${body.url}`);
    return this.arbiBotService.analyzeLink(body.url);
  }

  /**
   * 批量扫描分析 — 一次提交多个链接进行分析
   */
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Post('batch-analyze')
  async batchAnalyze(@Body() body: AnalyzeBatchDto) {
    this.logger.log(`[ArbiBot] Batch analyzing ${body.urls.length} links`);
    const results = await Promise.allSettled(
      body.urls.map((url) => this.arbiBotService.analyzeLink(url)),
    );
    return results.map((r, i) => ({
      url: body.urls[i],
      status: r.status,
      ...(r.status === 'fulfilled' ? r.value : { error: r.reason?.message }),
    }));
  }

  /**
   * 一站式扫描并上架 — 分析利差后自动创建商品
   * 解决 ArbiBot → Auto-Listing 链路断裂问题
   */
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Post('scan-and-list')
  async scanAndList(@Body() body: ScanAndListDto) {
    this.logger.log(`[ArbiBot] Scan-and-List: ${body.url} → ${body.targetCountry}`);

    // 1. 执行利差分析
    const analysis = await this.arbiBotService.analyzeLink(body.url);

    // 2. 检查利差是否达标
    const minMargin = body.minMarginPct || 30;
    if (analysis.arbitrageGapPct < minMargin / 100) {
      return {
        status: 'SKIPPED',
        reason: `Margin ${(analysis.arbitrageGapPct * 100).toFixed(1)}% below threshold ${minMargin}%`,
        analysis,
      };
    }

    // 3. 检查风险状态
    if (analysis.riskStatus === 'BLOCKED') {
      return {
        status: 'BLOCKED',
        reason: analysis.riskReason,
        analysis,
      };
    }

    // 4. 创建真实商品记录（ProductService）— 修复 ArbiBot→Product 链路断裂
    const product = await this.productService.createProduct({
      name: body.productName || `ArbiBot: ${body.url.split('/').pop() || 'Product'}`,
      category: body.category || 'General',
      description: body.description || `Import from ${body.url}`.slice(0, 500),
      costCny: analysis.sourcePriceCNY,
      priceIdr: analysis.allInPriceIDR,
      stock: body.stock || 100,
      imageUrls: body.imageUrls || [`https://placehold.co/400x400/F97316/FFFFFF?text=${encodeURIComponent(body.url.split('/').pop() || 'Product')}`],
      country: body.targetCountry || 'ID',
    });

    // 5. 同步发布到 CMS 爆款区
    const publishResult = await this.cms.bulkPublishProducts([{
      name: product.name,
      category: product.category,
      sourcePriceCNY: analysis.sourcePriceCNY,
      targetPriceIDR: analysis.allInPriceIDR,
      marginPct: analysis.arbitrageGapPct * 100,
      imageUrl: Array.isArray(JSON.parse(product.imageUrls)) ? JSON.parse(product.imageUrls)[0] : `https://placehold.co/400x400/F97316/FFFFFF?text=ArbiBot`,
    }]);

    return {
      status: 'LISTED',
      productId: product.id,
      analysis,
      publishResult,
    };
  }

  /**
   * Trending → CMS 一键推广为爆款
   * 解决 Trending 引擎热门产品无法自动推送的问题
   */
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Post('promote-to-hero')
  async promoteToHero(@Body() dto: PromoteToHeroDto) {
    this.logger.log(`[ArbiBot] Promoting trending product to Hero: ${dto.productName}`);
    return this.cms.bulkPublishProducts([{
      name: dto.productName,
      category: dto.category,
      sourcePriceCNY: dto.sourcePriceCNY,
      targetPriceIDR: dto.targetPriceIDR,
      marginPct: dto.marginPct,
      imageUrl: `https://placehold.co/400x400/F97316/FFFFFF?text=${encodeURIComponent(dto.productName.substring(0, 10))}`,
    }]);
  }

  /**
   * 扫描热门趋势 — 结合 TrendingEngine 扫描 + ArbiBot 分析
   */
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Post('scan-trending')
  async scanTrending(@Body() body: ScanTrendingDto) {
    const category = body.category || 'FASHION';
    const limit = body.limit || 25;
    // 一体化开关：为 true 时，达标商品自动创建并发布到 CMS 爆款区
    const autoList = body.autoList === true;
    const minMarginPct = body.minMarginPct ?? 30;

    this.logger.log(
      `[ArbiBot] Scanning trending for ${category}, limit ${limit}, autoList=${autoList}`,
    );

    // 从 Trending Engine 获取热门产品
    const hotProducts = await this.trending.scanHotProducts('ID', limit);

    // 过滤匹配品类并批量分析
    const filtered = category === 'ALL'
      ? hotProducts
      : hotProducts.filter((p) => p.category?.toUpperCase() === category.toUpperCase());

    const analyzed = await Promise.allSettled(
      filtered.map(async (p) => {
        try {
          const analysis = await this.arbiBotService.analyzeLink(
            p.shopeeUrl || `https://shopee.co.id/search?keyword=${encodeURIComponent(p.name)}`,
          );

          const marginPct = analysis.arbitrageGapPct * 100;
          const recommended = analysis.arbitrageGapPct > 0.3 && marginPct >= minMarginPct;

          let listing: { status: string; productId?: string; reason?: string } | null = null;

          // ─── 批量扫描 + 自动上架一体化 ───
          if (autoList && recommended) {
            if (analysis.riskStatus === 'BLOCKED') {
              listing = { status: 'BLOCKED', reason: analysis.riskReason };
            } else {
              // HotProduct 类型不含图片字段 → 以商品名生成占位图
              // （后续可由 AI 修图管线 ImagePipelineService 替换为本地化场景图）
              const placeholder = `https://placehold.co/400x400/F97316/FFFFFF?text=${encodeURIComponent((p.name || 'Product').substring(0, 12))}`;

              const product = await this.productService.createProduct({
                name: p.name || `ArbiBot Trending: ${p.category || category}`,
                category: p.category || category,
                description: `Auto-listed from trending scan (${category}).`.slice(0, 500),
                costCny: analysis.sourcePriceCNY,
                priceIdr: analysis.allInPriceIDR,
                stock: 100,
                imageUrls: [placeholder],
                country: 'ID',
              });

              await this.cms.bulkPublishProducts([{
                name: product.name,
                category: product.category,
                sourcePriceCNY: analysis.sourcePriceCNY,
                targetPriceIDR: analysis.allInPriceIDR,
                marginPct,
                imageUrl: placeholder,
              }]);

              this.logger.log(`[ArbiBot] Auto-listed trending product ${product.id} (margin ${marginPct.toFixed(1)}%)`);
              listing = { status: 'LISTED', productId: product.id };
            }
          }

          return {
            hotProduct: p,
            analysis,
            marginPct,
            recommended,
            listing,
          };
        } catch {
          return {
            hotProduct: p,
            analysis: null,
            recommended: false,
            listing: null,
          };
        }
      }),
    );

    return analyzed.map((r) => (r.status === 'fulfilled' ? r.value : { error: 'Analysis failed' }));
  }
}
