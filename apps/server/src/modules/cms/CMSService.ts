import { Injectable, Logger } from '@nestjs/common';

export interface Banner {
  id: string;
  stationId: string;
  imageUrl: string;
  targetUrl: string;
  priority: number;
  active: boolean;
}

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
  private banners: Banner[] = [
    {
      id: 'B-001',
      stationId: 'JKT',
      imageUrl: 'https://cdn.aceproxy.com/banners/ramadan-raya.jpg',
      targetUrl: '/promo/ramadan',
      priority: 1,
      active: true
    }
  ];

  private heroProducts: HeroProduct[] = [];

  /**
   * 一键铺货 (Bulk Publish Hero Products)
   * 响应产品经理需求：快速上线雅加达开斋节爆款
   */
  async bulkPublishProducts(products: Omit<HeroProduct, 'id' | 'status' | 'lastScrapedAt'>[]) {
    const newItems = products.map(p => ({
      ...p,
      id: `HP-${Math.random().toString(36).substr(2, 9)}`,
      status: 'ACTIVE' as const,
      lastScrapedAt: new Date().toISOString()
    }));
    
    this.heroProducts.push(...newItems);
    this.logger.log(`[CMS] Bulk published ${newItems.length} hero products to the Jakarta Catalog.`);
    return { success: true, count: newItems.length };
  }

  async getHeroProducts(): Promise<HeroProduct[]> {
    return this.heroProducts.filter(p => p.status === 'ACTIVE');
  }

  async getBanners(stationId: string): Promise<Banner[]> {

    return this.banners.filter(b => b.stationId === stationId && b.active)
      .sort((a, b) => b.priority - a.priority);
  }

  async updateBanner(bannerId: string, data: Partial<Banner>) {
    const index = this.banners.findIndex(b => b.id === bannerId);
    if (index !== -1) {
      this.banners[index] = { ...this.banners[index], ...data };
      this.logger.log(`[CMS] Banner ${bannerId} updated by Admin.`);
      return this.banners[index];
    }
    throw new Error('Banner not found');
  }

  async createBanner(data: Omit<Banner, 'id'>) {
    const newBanner = { ...data, id: `B-${Date.now()}` };
    this.banners.push(newBanner);
    this.logger.log(`[CMS] New banner created for station ${data.stationId}.`);
    return newBanner;
  }

  async deleteBanner(bannerId: string) {
    this.banners = this.banners.filter(b => b.id !== bannerId);
    this.logger.log(`[CMS] Banner ${bannerId} removed.`);
    return { success: true };
  }
}
