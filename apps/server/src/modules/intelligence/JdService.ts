import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigurationError, isDevMockEnabled } from '../../common/ConfigurationError';

export interface JdSearchResult {
  skuId: string;
  title: string;
  price: number;
  image: string;
  shopName: string;
  commissionRate: number;
  inStock: boolean;
}

export interface JdProductDetail {
  skuId: string;
  title: string;
  price: number;
  originalPrice: number;
  images: string[];
  category: string;
  brand: string;
  shopName: string;
  weight: number;
}

/**
 * JdService — 京东联盟 API 对接（jos.jd.com）
 *
 * 使用京东联盟 jd.union.open.goods.query 搜索商品
 * 网关：https://router.jd.com/api
 * 签名：MD5(app_secret + 参数排序 + app_secret) → 大写
 */
@Injectable()
export class JdService {
  private readonly logger = new Logger(JdService.name);
  private readonly GATEWAY = 'https://router.jd.com/api';

  private get appKey(): string { return process.env.JD_APP_KEY || ''; }
  private get appSecret(): string { return process.env.JD_APP_SECRET || ''; }

  isConfigured(): boolean {
    return !!(this.appKey && this.appSecret);
  }

  // ═══════════════════════════════════════════
  //  搜索商品
  // ═══════════════════════════════════════════

  async searchProducts(keyword: string, page = 1, pageSize = 10): Promise<JdSearchResult[]> {
    if (!this.isConfigured()) {
      if (isDevMockEnabled()) return this.mockSearch(keyword);
      throw new ConfigurationError('JD API', ['JD_APP_KEY', 'JD_APP_SECRET']);
    }

    try {
      const params = this.buildParams('jd.union.open.goods.query', {
        goodsReqDTO: JSON.stringify({
          keyword,
          pageIndex: page,
          pageSize: Math.min(pageSize, 50),
          sortName: 'price',
          sort: 'asc',
        }),
      });

      const data = await this.call(params);
      const code = data?.jd_union_open_goods_query_response?.code || data?.code;

      if (code && code !== 0) {
        this.logger.warn(`[JD] Search error: ${data?.jd_union_open_goods_query_response?.message || data?.msg}`);
        return [];
      }

      const result = data?.jd_union_open_goods_query_response?.queryResult || data?.result || {};
      const goodsList = result.data || [];

      return goodsList.map((g: any) => ({
        skuId: String(g.skuId || g.goodsId),
        title: g.skuName || g.goodsName || '',
        price: parseFloat(g.price || g.unitPrice || '0'),
        image: g.imageInfo?.imageList?.[0]?.url || g.mainImage || '',
        shopName: g.shopName || '京东商家',
        commissionRate: parseFloat(g.commissionInfo?.commissionShare || '0'),
        inStock: true,
      }));
    } catch (e) {
      this.logger.warn(`[JD] Search failed, using mock: ${e}`);
      return this.mockSearch(keyword);
    }
  }

  // ═══════════════════════════════════════════
  //  签名 + 调用
  // ═══════════════════════════════════════════

  private buildParams(method: string, extra: Record<string, any> = {}): Record<string, any> {
    return {
      method,
      app_key: this.appKey,
      timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, '+0800'),
      format: 'json',
      v: '2.0',
      sign_method: 'md5',
      ...extra,
    };
  }

  private generateSign(params: Record<string, any>): string {
    const sorted = Object.keys(params)
      .filter(k => k !== 'sign')
      .sort();

    let raw = this.appSecret;
    for (const k of sorted) {
      raw += k + String(params[k] ?? '');
    }
    raw += this.appSecret;

    return crypto.createHash('md5').update(raw, 'utf-8').digest('hex').toUpperCase();
  }

  private async call(params: Record<string, any>): Promise<any> {
    const sign = this.generateSign(params);
    const query = new URLSearchParams({ ...params, sign }).toString();
    const url = `${this.GATEWAY}?${query}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    try { return JSON.parse(text); } catch { return null; }
  }

  // ═══════════════════════════════════════════
  //  Mock
  // ═══════════════════════════════════════════

  private mockSearch(keyword: string): JdSearchResult[] {
    return [
      { skuId: 'jd-mock-001', title: `${keyword} 京东自营 2026新款`, price: 52, image: '', shopName: '京东自营', commissionRate: 3, inStock: true },
      { skuId: 'jd-mock-002', title: `${keyword} 品牌旗舰店 品质保障`, price: 68, image: '', shopName: '品牌旗舰店', commissionRate: 5, inStock: true },
      { skuId: 'jd-mock-003', title: `${keyword} 热卖爆款 闪电发货`, price: 39, image: '', shopName: '京东配送', commissionRate: 2, inStock: true },
    ];
  }
}
