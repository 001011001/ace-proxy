import { Controller, Get, Param, Query } from '@nestjs/common';
import { StationService } from './StationService';
import { ProductService } from '../product/ProductService';

/**
 * StationController - 站点接口
 * 为移动端提供首页货盘、产品列表、区域设置等展示数据。
 */
@Controller('station')
export class StationController {
  constructor(
    private readonly stationService: StationService,
    private readonly productService: ProductService,
  ) {}

  /**
   * 获取雅加达站点首页数据
   * 包含节日引擎、利差货盘、站点状态
   */
  @Get('jakarta/home')
  async getJakartaHome() {
    return await this.stationService.getJakartaHome();
  }

  /** 产品列表（分页、搜索、分类、排序） */
  @Get('products')
  async listProducts(
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

  /** 产品详情 */
  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  /** 爆款产品 */
  @Get('hero-products')
  async getHeroProducts(@Query('category') category?: string) {
    return this.productService.getHotProducts();
  }
}
