import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ProductService } from './ProductService';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /** 产品列表（分页、搜索、分类、排序） */
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
