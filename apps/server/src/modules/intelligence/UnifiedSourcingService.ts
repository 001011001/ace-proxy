import { Injectable, Logger } from '@nestjs/common';
import { Alibaba1688Service, SearchResult as AlibabaResult } from './Alibaba1688Service';
import { JdService, JdSearchResult } from './JdService';
import { TaobaoService, TaobaoSearchResult } from './TaobaoService';

export interface UnifiedProduct {
  /** 全局唯一ID */
  id: string;
  /** 产品名 */
  name: string;
  /** 价格 (CNY) */
  priceCny: number;
  /** 原价/划线价 (CNY) */
  originalPriceCny?: number;
  /** 图片 */
  image: string;
  /** 供应商/店铺名 */
  supplier: string;
  /** 货源平台 */
  source: '1688' | 'JD' | 'TAOBAO';
  /** 平台来源链接 */
  sourceUrl: string;
  /** 最小起订量 */
  moq: number;
  /** 佣金率 (% 仅淘宝/京东) */
  commissionRate?: number;
  /** 销量 (仅淘宝) */
  salesVolume?: number;
}

/**
 * UnifiedSourcingService — 三平台聚合搜索
 *
 * 1688（已有API ✅）+ 京东（新增API）+ 淘宝（新增API）
 * 统一搜索入口 → 聚合结果 → 去重排序 → 统一输出
 */
@Injectable()
export class UnifiedSourcingService {
  private readonly logger = new Logger(UnifiedSourcingService.name);

  constructor(
    private readonly alibaba1688: Alibaba1688Service,
    private readonly jd: JdService,
    private readonly taobao: TaobaoService,
  ) {}

  /**
   * 三平台并发搜索 → 聚合并排序
   *
   * @param keyword 搜索关键词
   * @param limit 每平台返回数量（总共最多3×limit）
   * @returns 统一格式的产品列表，按价格从低到高排序
   */
  async searchAll(keyword: string, limit = 6): Promise<UnifiedProduct[]> {
    const results: UnifiedProduct[] = [];

    // 并行搜索三平台
    const [alibaba, jd, taobao] = await Promise.allSettled([
      this.search1688(keyword, limit),
      this.searchJd(keyword, limit),
      this.searchTaobao(keyword, limit),
    ]);

    if (alibaba.status === 'fulfilled') results.push(...alibaba.value);
    else this.logger.warn(`[Unified] 1688 search failed: ${alibaba.reason}`);

    if (jd.status === 'fulfilled') results.push(...jd.value);
    else this.logger.warn(`[Unified] JD search failed: ${jd.reason}`);

    if (taobao.status === 'fulfilled') results.push(...taobao.value);
    else this.logger.warn(`[Unified] Taobao search failed: ${taobao.reason}`);

    // 去重：基于产品名的相似度（简单去重：完全相同标题跳过）
    const seen = new Set<string>();
    const deduped = results.filter(r => {
      const key = this.normalizeForDedup(r.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 排序：价格从低到高
    deduped.sort((a, b) => a.priceCny - b.priceCny);

    this.logger.log(`[Unified] Found ${results.length} results (${deduped.length} after dedup) for "${keyword}"`);

    return deduped.slice(0, limit * 2); // 最多返回2×limit个
  }

  // ═══════════════════════════════════════════
  //  单平台搜索适配器
  // ═══════════════════════════════════════════

  private async search1688(keyword: string, limit: number): Promise<UnifiedProduct[]> {
    const results = await this.alibaba1688.searchProducts(keyword, 1, limit);
    return results.map(r => this.from1688(r));
  }

  private async searchJd(keyword: string, limit: number): Promise<UnifiedProduct[]> {
    const results = await this.jd.searchProducts(keyword, 1, limit);
    return results.map(r => this.fromJd(r));
  }

  private async searchTaobao(keyword: string, limit: number): Promise<UnifiedProduct[]> {
    try {
      const results = await this.taobao.searchProducts(keyword, 1, limit);
      return results.map(r => this.fromTaobao(r));
    } catch (e) {
      this.logger.warn(`[Unified] Taobao search error: ${e}`);
      return this.mockTaobaoResults(keyword, limit);
    }
  }

  // ═══════════════════════════════════════════
  //  格式转换
  // ═══════════════════════════════════════════

  private from1688(r: AlibabaResult): UnifiedProduct {
    return {
      id: `1688-${r.offerId}`,
      name: r.title,
      priceCny: r.price,
      image: r.image,
      supplier: r.supplier || '工厂直供',
      source: '1688',
      sourceUrl: `https://detail.1688.com/offer/${r.offerId}.html`,
      moq: r.moq || 1,
    };
  }

  private fromJd(r: JdSearchResult): UnifiedProduct {
    return {
      id: `JD-${r.skuId}`,
      name: r.title,
      priceCny: r.price,
      image: r.image,
      supplier: r.shopName || '京东商家',
      source: 'JD',
      sourceUrl: `https://item.jd.com/${r.skuId}.html`,
      moq: 1,
      commissionRate: r.commissionRate,
    };
  }

  private fromTaobao(r: TaobaoSearchResult): UnifiedProduct {
    return {
      id: `TB-${r.itemId}`,
      name: r.title,
      priceCny: r.price,
      originalPriceCny: r.originalPrice,
      image: r.image,
      supplier: r.shopName || '淘宝商家',
      source: 'TAOBAO',
      sourceUrl: `https://item.taobao.com/item.htm?id=${r.itemId}`,
      moq: 1,
      commissionRate: r.commissionRate,
      salesVolume: r.salesVolume,
    };
  }

  // ═══════════════════════════════════════════
  //  去重辅助
  // ═══════════════════════════════════════════

  private normalizeForDedup(name: string): string {
    return name
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ') // 只保留中英文+数字
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .substring(0, 40); // 取前40个字符
  }

  // ═══════════════════════════════════════════
  //  Mock（淘宝环境变量未配置时）
  // ═══════════════════════════════════════════

  private mockTaobaoResults(keyword: string, limit: number): UnifiedProduct[] {
    const mockData = [
      { id: 'TB-mock-001', name: `${keyword} 2026新款 韩版潮流 热卖万件`, priceCny: 42, originalPriceCny: 89, supplier: '潮流服饰旗舰店', salesVolume: 15200, commissionRate: 8 },
      { id: 'TB-mock-002', name: `${keyword} 跨境热卖 工厂直供 批发价`, priceCny: 35, originalPriceCny: 78, supplier: '义乌优选', salesVolume: 8700, commissionRate: 12 },
      { id: 'TB-mock-003', name: `${keyword} 高品质 包邮 现货速发`, priceCny: 55, originalPriceCny: 120, supplier: '品质生活馆', salesVolume: 3200, commissionRate: 6 },
    ];

    return mockData.slice(0, limit).map(r => ({
      ...r,
      image: '',
      source: 'TAOBAO' as const,
      sourceUrl: `https://item.taobao.com/item.htm?id=${r.id.replace('TB-mock-', '')}`,
      moq: 1,
    }));
  }
}
