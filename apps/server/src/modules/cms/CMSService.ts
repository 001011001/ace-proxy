import { Injectable, Logger } from '@nestjs/common';

export interface Banner {
  id: string;
  stationId: string;
  imageUrl: string;
  targetUrl: string;
  priority: number;
  active: boolean;
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
}
