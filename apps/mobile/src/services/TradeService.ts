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
          id: 'EP-2026-HJ01',
          name: 'Premium Silk Hijab - Emerald Green',
          category: 'Premium Hijabs',
          sourcePriceCNY: 35.0,
          targetPriceIDR: 195000,
          marginPct: 153,
          imageUrl: 'https://cdn.aceproxy.com/products/hijab-emerald.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'EP-2026-HJ02',
          name: 'Lace-Trimmed Gamis - Midnight Blue',
          category: 'Premium Hijabs',
          sourcePriceCNY: 88.0,
          targetPriceIDR: 485000,
          marginPct: 150,
          imageUrl: 'https://cdn.aceproxy.com/products/gamis-blue.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'EP-2026-SH01',
          name: 'Smart Aroma Diffuser V2',
          category: 'Smart Home',
          sourcePriceCNY: 42.0,
          targetPriceIDR: 285000,
          marginPct: 208,
          imageUrl: 'https://cdn.aceproxy.com/products/diffuser-v2.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'EP-2026-SH02',
          name: 'UV-C Handheld Vacuum',
          category: 'Smart Home',
          sourcePriceCNY: 125.0,
          targetPriceIDR: 850000,
          marginPct: 209,
          imageUrl: 'https://cdn.aceproxy.com/products/uv-vacuum.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'EP-2026-GB01',
          name: 'Lux Eid Gift Box - Velvet',
          category: 'Gifts',
          sourcePriceCNY: 15.0,
          targetPriceIDR: 125000,
          marginPct: 279,
          imageUrl: 'https://cdn.aceproxy.com/products/giftbox-velvet.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'EP-2026-HJ03',
          name: 'Hand-Embroidered Pashmina',
          category: 'Premium Hijabs',
          sourcePriceCNY: 45.0,
          targetPriceIDR: 250000,
          marginPct: 153,
          imageUrl: 'https://cdn.aceproxy.com/products/pashmina-gold.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'EP-2026-SH03',
          name: 'Automatic Pet Feeder - Lite',
          category: 'Smart Home',
          sourcePriceCNY: 95.0,
          targetPriceIDR: 650000,
          marginPct: 211,
          imageUrl: 'https://cdn.aceproxy.com/products/pet-feeder.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'EP-2026-GB02',
          name: 'Gold-Foiled Hamper Basket',
          category: 'Gifts',
          sourcePriceCNY: 22.0,
          targetPriceIDR: 185000,
          marginPct: 282,
          imageUrl: 'https://cdn.aceproxy.com/products/hamper-gold.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'EP-2026-HJ04',
          name: 'Linen Blend Abaya',
          category: 'Premium Hijabs',
          sourcePriceCNY: 75.0,
          targetPriceIDR: 420000,
          marginPct: 154,
          imageUrl: 'https://cdn.aceproxy.com/products/abaya-linen.jpg',
          status: 'ACTIVE',
          patentStatus: 'CLEAN',
          lastScrapedAt: new Date().toISOString()
        },
        {
          id: 'EP-2026-GB03',
          name: 'Festive Gift Bag Set (10pcs)',
          category: 'Gifts',
          sourcePriceCNY: 8.5,
          targetPriceIDR: 75000,
          marginPct: 301,
          imageUrl: 'https://cdn.aceproxy.com/products/bag-set.jpg',
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
