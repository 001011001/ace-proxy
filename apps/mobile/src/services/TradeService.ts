import { api } from './APIService';

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

export interface StationHome {
  stationName: string;
  regionCode: string;
  currency: string;
  language: string;
  activeHoliday: any;
  announcement: string;
  products: {
    id: string;
    name: string;
    category: string;
    sourcePriceCny: number;
    localPriceIdr: number;
    arbitrageGapPct: number;
    status: string;
    patentStatus: string;
    lastAuditAt: string;
  }[];
  trendingCategories: string[];
  lossPreventionStatus: string;
}

export class TradeService {
  /**
   * Get the full Jakarta station home with live product data from the backend
   */
  static async getStationHome(): Promise<StationHome> {
    try {
      return await api.getJakartaHome();
    } catch (error) {
      console.error('[TradeService] Failed to fetch station home:', error);
      throw error;
    }
  }

  /**
   * Get hero products from the backend (used by HomeScreen)
   */
  static async getHeroProducts(): Promise<HeroProduct[]> {
    try {
      const home = await TradeService.getStationHome();
      return home.products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category || 'General',
        sourcePriceCNY: p.sourcePriceCny,
        targetPriceIDR: p.localPriceIdr,
        marginPct: p.arbitrageGapPct ? Math.round(p.arbitrageGapPct * 100) : 0,
        imageUrl: `https://placehold.co/400x400/F97316/FFFFFF?text=${encodeURIComponent(p.name.substring(0, 12))}`,
        status: p.status as 'ACTIVE',
        lastScrapedAt: p.lastAuditAt,
      }));
    } catch (error) {
      console.error('[TradeService] Failed to fetch hero products:', error);
      return [];
    }
  }

  /**
   * Execute an arbitrage order
   */
  static async executeArbitrage(
    productId: string,
    productData: { total: number; cost: number; shipping: number; serviceFee: number }
  ): Promise<{ success: boolean; orderId: string }> {
    try {
      const result = await api.createOrder({
        items: [{ productId, quantity: 1 }],
        amounts: {
          total: productData.total,
          cost: productData.cost,
          shipping: productData.shipping,
          serviceFee: productData.serviceFee,
        },
        destination: 'JKT',
        terms_accepted: true,
      });
      return { success: true, orderId: result.id || `ORD-${Date.now()}` };
    } catch (error) {
      console.error('[TradeService] Order failed:', error);
      throw error;
    }
  }
}
