import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductService } from './ProductService';
import { ComplianceService } from '../compliance/ComplianceService';
import { AiTranslateService } from '../ai-translate/AiTranslateService';

@ApiTags('Product — 商品')
@Controller('product')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(
    private readonly productService: ProductService,
    private readonly compliance: ComplianceService,
    private readonly translate: AiTranslateService,
  ) {}

  /** 创建商品（含合规检查 + 自动翻译） */
  @ApiOperation({ summary: '创建商品', description: '创建新商品，自动执行合规检查和本地化翻译' })
  @ApiResponse({ status: 201, description: '商品创建成功' })
  @Post('create')
  async create(@Body() body: {
    name: string;
    category: string;
    description?: string;
    costCny: number;
    priceIdr: number;
    stock?: number;
    supplierId?: string;
    imageUrls?: string[];
    country?: string;
  }) {
    const country = body.country || 'ID';

    // 1. 合规检查
    const complianceResult = await this.compliance.checkCompliance({
      name: body.name,
      category: body.category,
      description: body.description,
      destinationCountry: country,
    });

    if (!complianceResult.passed) {
      this.logger.warn(`[Product] Compliance FAILED for "${body.name}": ${complianceResult.banned.join(', ')}`);
      return {
        success: false,
        reason: 'COMPLIANCE_BLOCKED',
        issues: {
          banned: complianceResult.banned,
          restricted: complianceResult.restricted,
          countryIssues: complianceResult.countryIssues,
        },
      };
    }

    // 2. 自动本地化翻译（印尼语）
    let localizedDesc = body.description;
    try {
      const translation = await this.translate.translateProductListing({
        title: body.name,
        description: body.description || body.name,
        specs: [],
        targetCountry: country,
      });
      localizedDesc = translation.description;
    } catch {
      this.logger.warn(`[Product] Translation failed for "${body.name}", using original description`);
    }

    // 3. 创建商品
    const product = await this.productService.createProduct({
      ...body,
      description: localizedDesc || body.description,
    });

    return {
      success: true,
      product,
      compliance: {
        passed: true,
        hsCodeSuggestion: complianceResult.hsCodeSuggestion,
      },
    };
  }

  /** 产品列表（分页、搜索、分类、排序） */
  @ApiOperation({ summary: '商品列表', description: '分页查询商品，支持搜索、分类、排序' })
  @ApiResponse({ status: 200, description: '返回商品分页列表' })
  @Get('list')
  async list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sort') sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular',
  ) {
    return this.productService.listProducts({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      category,
      search,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sort,
    });
  }

  /** 获取产品分类列表 */
  @Get('categories')
  async categories() {
    return this.productService.getCategories();
  }

  /** 推荐产品 */
  @Get('featured')
  async featured() {
    return this.productService.getFeaturedProducts();
  }

  /** 热销产品 */
  @Get('hot')
  async hot() {
    return this.productService.getHotProducts();
  }

  /** 产品详情 */
  @Get(':id')
  async detail(@Param('id') id: string) {
    const product = await this.productService.getProductById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
