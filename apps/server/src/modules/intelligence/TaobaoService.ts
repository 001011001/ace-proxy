import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigurationError, isDevMockEnabled } from '../../common/ConfigurationError';

export interface TaobaoSearchResult {
  itemId: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  shopName: string;
  salesVolume: number;
  commissionRate: number;
}

export interface TaobaoProductDetail {
  itemId: string;
  title: string;
  price: number;
  originalPrice: number;
  images: string[];
  category: string;
  shopName: string;
  weight: number;
}

/**
 * TaobaoService — 淘宝联盟 API 对接（open.taobao.com）
 *
 * 使用淘宝客商品搜索 taobao.tbk.item.get
 * 网关：https://eco.taobao.com/router/rest
 * 签名：MD5(secret + 参数排序 + secret) → 大写
 *
 * 注意：淘宝开放平台只给淘宝客返佣搜索，不给完整的商品库搜索。
 * 这意味着搜索结果可能不够全，但对于"找同款"场景足够用。
 */
@Injectable()
export class TaobaoService {
  private readonly logger = new Logger(TaobaoService.name);
  private readonly GATEWAY = 'https://eco.taobao.com/router/rest';

  private get appKey(): string { return process.env.TAOBAO_APP_KEY || ''; }
  private get appSecret(): string { return process.env.TAOBAO_APP_SECRET || ''; }
  private get adzoneId(): string { return process.env.TAOBAO_ADZONE_ID || ''; }

  isConfigured(): boolean {
    return !!(this.appKey && this.appSecret);
  }

  // ═══════════════════════════════════════════
  //  搜索商品（淘宝客）
  // ═══════════════════════════════════════════

  async searchProducts(keyword: string, page = 1, pageSize = 10): Promise<TaobaoSearchResult[]> {
    if (!this.isConfigured()) {
      if (isDevMockEnabled()) return this.mockSearch(keyword);
      throw new ConfigurationError('Taobao API', ['TAOBAO_APP_KEY', 'TAOBAO_APP_SECRET']);
    }

    try {
      const params = this.buildParams('taobao.tbk.item.get', {
        q: keyword,
        page_no: page,
        page_size: Math.min(pageSize, 50),
        sort: 'total_sales_des',
        adzone_id: this.adzoneId,
        fields: 'num_iid,title,pict_url,small_images,reserve_price,zk_final_price,user_type,provcity,item_url,nick,seller_id,volume,commission_rate',
      });

      const data = await this.call(params);
      const errCode = data?.error_response?.code;

      if (errCode) {
        this.logger.warn(`[Taobao] Search error: ${data.error_response.msg}`);
        return [];
      }

      const results = data?.tbk_item_get_response?.results?.n_tbk_item || [];
      return results.map((r: any) => ({
        itemId: String(r.num_iid),
        title: r.title || '',
        price: parseFloat(r.zk_final_price || '0'),
        originalPrice: parseFloat(r.reserve_price || '0'),
        image: r.pict_url || '',
        shopName: r.nick || '淘宝商家',
        salesVolume: parseInt(r.volume || '0'),
        commissionRate: parseFloat(r.commission_rate || '0'),
      }));
    } catch (e) {
      this.logger.warn(`[Taobao] Search failed, using mock: ${e}`);
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

  private mockSearch(keyword: string): TaobaoSearchResult[] {
    return [
      { itemId: 'tb-mock-001', title: `${keyword} 2026新款 韩版潮流 热卖`, price: 42, originalPrice: 89, image: '', shopName: '潮流服饰旗舰店', salesVolume: 15200, commissionRate: 8 },
      { itemId: 'tb-mock-002', title: `${keyword} 跨境热卖 工厂直供 批发价`, price: 35, originalPrice: 78, image: '', shopName: '义乌优选', salesVolume: 8700, commissionRate: 12 },
      { itemId: 'tb-mock-003', title: `${keyword} 高品质 包邮 现货速发`, price: 55, originalPrice: 120, image: '', shopName: '品质生活馆', salesVolume: 3200, commissionRate: 6 },
    ];
  }
}
