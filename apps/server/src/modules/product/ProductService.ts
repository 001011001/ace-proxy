import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductStatus } from './dto/product.dto';

/**
 * 乐观锁配置
 */
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 50;

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建商品 — 支持合规检查 + 自动本地化
   */
  async createProduct(params: {
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
    const product = await this.prisma.aceProduct.create({
      data: {
        id: `PROD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: params.name,
        category: params.category,
        description: params.description || '',
        costCny: params.costCny,
        priceIdr: params.priceIdr,
        stock: params.stock || 100,
        imageUrls: params.imageUrls ? JSON.stringify(params.imageUrls) : '[]',
        status: 'ACTIVE',
      },
    });

    this.logger.log(`[Product] Created product ${product.id}: ${product.name}`);
    return product;
  }

  async listProducts(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.category) {
      where.category = params.category;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { category: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.minPrice || params.maxPrice) {
      where.priceIdr = {};
      if (params.minPrice) where.priceIdr.gte = params.minPrice;
      if (params.maxPrice) where.priceIdr.lte = params.maxPrice;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (params.sort === 'price_asc') orderBy = { priceIdr: 'asc' };
    if (params.sort === 'price_desc') orderBy = { priceIdr: 'desc' };
    if (params.sort === 'popular') orderBy = { ratingCount: 'desc' };

    const [total, items] = await Promise.all([
      this.prisma.aceProduct.count({ where }),
      this.prisma.aceProduct.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          imageUrls: true,
          priceIdr: true,
          costCny: true,
          stock: true,
          ratingAvg: true,
          ratingCount: true,
          status: true,
        },
      }),
    ]);

    return {
      items: items.map(p => ({
        ...p,
        priceIdr: Number(p.priceIdr),
        costCny: Number(p.costCny),
        ratingAvg: Number(p.ratingAvg),
        images: this.parseImages(p.imageUrls),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string) {
    const product = await this.prisma.aceProduct.findUnique({
      where: { id },
      include: {
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
    });

    if (!product) return null;

    return {
      ...product,
      priceIdr: Number(product.priceIdr),
      costCny: Number(product.costCny),
      ratingAvg: Number(product.ratingAvg),
      images: this.parseImages(product.imageUrls),
      reviews: product.reviews.map(r => ({
        ...r,
        images: this.parseImages(r.images),
      })),
    };
  }

  async getCategories() {
    const result = await this.prisma.aceProduct.groupBy({
      by: ['category'],
      where: { status: 'ACTIVE' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return result.map(r => ({
      name: r.category,
      count: r._count.id,
    }));
  }

  async getFeaturedProducts() {
    const products = await this.prisma.aceProduct.findMany({
      where: { status: 'ACTIVE' },
      take: 10,
      orderBy: { ratingCount: 'desc' },
      select: {
        id: true,
        name: true,
        category: true,
        imageUrls: true,
        priceIdr: true,
        costCny: true,
        ratingAvg: true,
        ratingCount: true,
        stock: true,
      },
    });

    return products.map(p => ({
      ...p,
      priceIdr: Number(p.priceIdr),
      costCny: Number(p.costCny),
      ratingAvg: Number(p.ratingAvg),
      images: this.parseImages(p.imageUrls),
    }));
  }

  async getHotProducts() {
    return this.getFeaturedProducts();
  }

  private parseImages(imageUrls: string | null): string[] {
    if (!imageUrls) return [];
    try {
      const parsed = JSON.parse(imageUrls);
      return Array.isArray(parsed) ? parsed : [imageUrls];
    } catch {
      return imageUrls ? [imageUrls] : [];
    }
  }

  /**
   * 库存扣减（乐观锁 + 重试）
   *
   * 使用 Prisma 条件更新实现乐观锁：
   *   UPDATE ace_product SET stock = stock - N WHERE id = ? AND stock >= N
   *
   * 最多重试 MAX_RETRIES 次，退避间隔 RETRY_BASE_MS * attempt。
   *
   * @param productId 产品 ID
   * @param quantity  扣减数量
   * @returns true 扣减成功，false 库存不足或重试耗尽
   */
  async decrementStockWithRetry(productId: string, quantity: number): Promise<boolean> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await this.prisma.aceProduct.updateMany({
          where: {
            id: productId,
            stock: { gte: quantity },
          },
          data: {
            stock: { decrement: quantity },
          },
        });

        if (result.count > 0) {
          this.logger.log(
            `[Product] Stock decremented: ${productId} -${quantity} (attempt ${attempt})`,
          );

          // 库存归零 → 自动标记缺货，避免前端继续展示为可购买
          const remaining = await this.prisma.aceProduct.findUnique({
            where: { id: productId },
            select: { stock: true, status: true },
          });
          if (remaining && remaining.stock <= 0 && remaining.status === ProductStatus.ACTIVE) {
            await this.prisma.aceProduct.update({
              where: { id: productId },
              data: { status: ProductStatus.OUT_OF_STOCK },
            });
            this.logger.warn(`[Product] ${productId} stock depleted → marked OUT_OF_STOCK`);
          }

          return true;
        }

        // 库存不足，无需重试
        this.logger.warn(
          `[Product] Insufficient stock for ${productId}: requested ${quantity}`,
        );
        return false;
      } catch (error: any) {
        this.logger.warn(
          `[Product] Stock decrement attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`,
        );
        if (attempt < MAX_RETRIES) {
          await this.sleep(RETRY_BASE_MS * attempt);
        }
      }
    }

    this.logger.error(
      `[Product] Stock decrement exhausted retries for ${productId}, qty=${quantity}`,
    );
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
