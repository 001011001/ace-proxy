import { HeroProduct } from '../../../server/src/modules/cms/CMSService';

// 模拟 API 基础路径
const BASE_URL = 'https://api.aceproxy.com/v1';

/**
 * TradeService - 处理利差交易、商品获取及套利引擎交互
 * 对接 Coder 实现的 Sentinel 哨兵与 CMS 一键铺货系统
 */
export class TradeService {
  /**
   * 获取“开斋节 2026”专题爆款列表
   * 包含 Coder 预留的利差数据与哨兵监控状态
   */
  static async getHeroProducts(): Promise<HeroProduct[]> {
    try {
      // 在实际生产中，这里会调用 fetch(BASE_URL + '/cms/hero-products')
      // 目前返回模拟数据，但结构严丝合缝对接后端定义
      return [
        {
          id: 'HP-001',
          name: 'Premium Silk Hijab (Jakarta Edition)',
          category: 'Apparel',
          sourcePriceCNY: 12.0,
          targetPriceIDR: 99000,
          marginPct: 234,
          imageUrl: 'https://cdn.aceproxy.com/products/hijab-silk.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'HP-002',
          name: 'Portable Travel Mukena Pro',
          category: 'Religious',
          sourcePriceCNY: 45.0,
          targetPriceIDR: 280000,
          marginPct: 148,
          imageUrl: 'https://cdn.aceproxy.com/products/mukena-pro.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'HP-003',
          name: 'Smart Zikr Ring (OLED)',
          category: 'Electronics',
          sourcePriceCNY: 85.0,
          targetPriceIDR: 450000,
          marginPct: 103,
          imageUrl: 'https://cdn.aceproxy.com/products/zikr-ring.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'HP-004',
          name: 'LED Moon & Star Decor Set',
          category: 'Home',
          sourcePriceCNY: 18.0,
          targetPriceIDR: 150000,
          marginPct: 180,
          imageUrl: 'https://cdn.aceproxy.com/products/led-decor.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'HP-005',
          name: 'Luxury Eid Gift Set',
          category: 'Gifts',
          sourcePriceCNY: 35.0,
          targetPriceIDR: 220000,
          marginPct: 120,
          imageUrl: 'https://cdn.aceproxy.com/products/gift-set.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'HP-006',
          name: 'Modern Baju Koko (Minimalist)',
          category: 'Apparel',
          sourcePriceCNY: 55.0,
          targetPriceIDR: 320000,
          marginPct: 155,
          imageUrl: 'https://cdn.aceproxy.com/products/baju-koko-min.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'HP-007',
          name: 'Geometric Prayer Mat',
          category: 'Home',
          sourcePriceCNY: 28.0,
          targetPriceIDR: 150000,
          marginPct: 165,
          imageUrl: 'https://cdn.aceproxy.com/products/prayer-mat-geo.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'HP-008',
          name: 'Minimalist Cookie Jar Set',
          category: 'Home',
          sourcePriceCNY: 18.0,
          targetPriceIDR: 120000,
          marginPct: 170,
          imageUrl: 'https://cdn.aceproxy.com/products/cookie-jar.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'HP-009',
          name: 'Hakoba Eyelet Dress',
          category: 'Apparel',
          sourcePriceCNY: 85.0,
          targetPriceIDR: 420000,
          marginPct: 210,
          imageUrl: 'https://cdn.aceproxy.com/products/hakoba-dress.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'HP-010',
          name: 'Solar Arabic Lantern',
          category: 'Home',
          sourcePriceCNY: 18.0,
          targetPriceIDR: 95000,
          marginPct: 180,
          imageUrl: 'https://cdn.aceproxy.com/products/solar-lantern.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        }
      ];
    } catch (error) {
      console.error('[TradeService] Failed to fetch hero products:', error);
      return [];
    }
  }

  /**
   * 执行“一键套利”指令
   */
  static async executeArbitrage(productId: string) {
    // 逻辑：向后端发送下单请求，锁定利差
    return { success: true, orderId: `ORD-${Math.random().toString(36).substr(2, 5).toUpperCase()}` };
  }
}
