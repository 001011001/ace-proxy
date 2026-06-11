import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface HeroProduct {
  id: string;
  name: string;
  category: string;
  sourcePriceCNY: number;
  targetPriceIDR: number;
  marginPct: number;
  imageUrl: string;
  status: 'ACTIVE' | 'ARCHIVED';
  lastScrapedAt: string;
}

@Injectable()
export class CMSService {
  private readonly logger = new Logger(CMSService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getHeroProducts(): Promise<HeroProduct[]> {
    const products = await this.prisma.aceHeroProduct.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { arbitrageGapPct: 'desc' },
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category || 'General',
      sourcePriceCNY: Number(p.sourcePriceCny) || 0,
      targetPriceIDR: Number(p.localPriceIdr) || 0,
      marginPct: p.arbitrageGapPct ? Number(p.arbitrageGapPct) * 100 : 0,
      imageUrl: `https://placehold.co/400x400/F97316/FFFFFF?text=${encodeURIComponent(p.name.substring(0, 10))}`,
      status: 'ACTIVE' as const,
      lastScrapedAt: p.lastAuditAt?.toISOString() || new Date().toISOString(),
    }));
  }

  async bulkPublishProducts(products: Omit<HeroProduct, 'id' | 'status' | 'lastScrapedAt'>[]) {
    let count = 0;
    for (const p of products) {
      await this.prisma.aceHeroProduct.upsert({
        where: { id: `HP-${Date.now()}-${count}` },
        update: {},
        create: {
          id: `HP-${Date.now()}-${count}`,
          name: p.name,
          category: p.category,
          sourcePriceCny: p.sourcePriceCNY,
          localPriceIdr: p.targetPriceIDR,
          arbitrageGapPct: p.marginPct / 100,
          status: 'ACTIVE',
        },
      });
      count++;
    }
    this.logger.log(`[CMS] Bulk published ${count} products.`);
    return { success: true, count };
  }
}
