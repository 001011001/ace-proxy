import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

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

    const where: any = { status: 'ACTIVE' };

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
}
