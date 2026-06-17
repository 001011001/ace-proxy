import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigurationError, isDevMockEnabled } from '../../common/ConfigurationError';

export interface SearchResult {
  offerId: string;
  title: string;
  price: number;
  priceUnit: string;
  image: string;
  supplier: string;
  moq: number;
}

export interface ProductDetail {
  offerId: string;
  title: string;
  price: number;
  priceRange: { min: number; max: number };
  images: string[];
  specifications: Array<{ name: string; value: string }>;
  moq: number;
  supplier: {
    name: string;
    location: string;
  };
  weight: number;
  weightUnit: string;
}

/**
 * Alibaba1688Service — 1688 开放平台 API 对接（基于官方文档 2026-06-11 修正）
 *
 * 关键修正：
 * - 网关：gw.open.1688.com（非 gw.api.1688.com）
 * - 方法：alibaba.offer.get / .price.get / .spec.get（非 alibaba.product.*）
 * - 签名：app_secret + key1value1 + key2value2 + ... + app_secret（key=value无分隔符！）
 * - 时间戳：13位毫秒（非 ISO 格式）
 * - 获取完整商品需4次API调用串联
 *
 * 注册：open.1688.com → 企业实名 → 创建应用 → 获取 AppKey+AppSecret
 */
@Injectable()
export class Alibaba1688Service {
  private readonly logger = new Logger(Alibaba1688Service.name);
  private readonly GATEWAY = 'https://gw.open.1688.com/openapi/param2/1/portals.open/';

  private get appKey(): string { return process.env.ALIBABA_APP_KEY || ''; }
  private get appSecret(): string { return process.env.ALIBABA_APP_SECRET || ''; }
  private get accessToken(): string { return process.env.ALIBABA_ACCESS_TOKEN || ''; }

  isConfigured(): boolean {
    return !!(this.appKey && this.appSecret);
  }

  // ═══════════════════════════════════════════
  //  搜索商品
  // ═══════════════════════════════════════════
  async searchProducts(keyword: string, page = 1, pageSize = 20): Promise<SearchResult[]> {
    if (!this.isConfigured()) {
      if (isDevMockEnabled()) return this.mockSearch(keyword);
      throw new ConfigurationError('1688 API', ['ALIBABA_APP_KEY', 'ALIBABA_APP_SECRET', 'ALIBABA_ACCESS_TOKEN']);
    }

    try {
      const params = this.baseParams('alibaba.icbu.product.search', {
        keyword,
        pageNo: page,
        pageSize: Math.min(pageSize, 50),
        language: 'ENGLISH',
      });

      const data = await this.call(params);
      if (data?.error_code && data.error_code !== 0) {
        this.logger.warn(`[1688] Search error: ${data.error_msg || data.error_message}`);
        return [];
      }

      const products = data?.result?.products || data?.products || [];
      return products.map((p: any) => ({
        offerId: String(p.offerId || p.id),
        title: p.subject || p.title || '',
        price: parseFloat(p.price || p.minPrice || '0'),
        priceUnit: 'CNY',
        image: p.mainImage || p.imageUrl || '',
        supplier: p.supplierName || '',
        moq: parseInt(p.moq || p.minOrderQuantity || '1'),
      }));
    } catch (e) {
      this.logger.error(`[1688] Search failed: ${e}`);
      if (isDevMockEnabled()) return this.mockSearch(keyword);
      throw new ConfigurationError('1688 API', ['ALIBABA_APP_KEY — API call failed']);
    }
  }

  // ═══════════════════════════════════════════
  //  获取商品详情（4次API串联）
  // ═══════════════════════════════════════════
  async getProductDetail(offerId: string): Promise<ProductDetail | null> {
    if (!this.isConfigured()) return this.mockDetail(offerId);

    try {
      const base = await this.callOfferGet(offerId);
      if (!base) return null;

      const price = await this.callOfferPriceGet(offerId);
      const specs = await this.callOfferSpecGet(offerId);

      return {
        offerId,
        title: base.subject || base.title || '',
        price: price?.min || 0,
        priceRange: { min: price?.min || 0, max: price?.max || 0 },
        images: Array.isArray(base.imageList) ? base.imageList : (base.mainImage ? [base.mainImage] : []),
        specifications: this.flattenSpecs(specs),
        moq: price?.moq || 1,
        supplier: { name: '', location: '' },
        weight: 0.5,
        weightUnit: 'kg',
      };
    } catch (e) {
      this.logger.error(`[1688] Detail failed for ${offerId}: ${e}`);
      return null;
    }
  }

  // ═══════════════════════════════════════════
  //  三步API调用
  // ═══════════════════════════════════════════

  /** Step 1: 基础信息 */
  private async callOfferGet(offerId: string): Promise<any> {
    const params = this.baseParams('alibaba.offer.get', { offerId });
    const data = await this.call(params);
    if (data?.error_code && data.error_code !== 0) {
      this.logger.warn(`[1688] offer.get error: ${data.error_msg}`);
      return null;
    }
    return data?.result?.offer || data?.result || data;
  }

  /** Step 2: 价格信息 */
  private async callOfferPriceGet(offerId: string): Promise<{ min: number; max: number; moq: number } | null> {
    const params = this.baseParams('alibaba.offer.price.get', { offerId });
    const data = await this.call(params);
    if (data?.error_code && data.error_code !== 0) return null;

    const info = data?.result?.priceInfo || data?.result || data;
    const range = (info.priceRange || info.price || '0').toString().split('-');
    const min = parseFloat(range[0]) || 0;
    const max = range.length > 1 ? parseFloat(range[1]) : min;
    const moq = parseInt(String(info.moq || '1').replace(/\+/g, ''));

    return { min, max, moq: isNaN(moq) ? 1 : moq };
  }

  /** Step 3: SKU 规格 */
  private async callOfferSpecGet(offerId: string): Promise<any[]> {
    const params = this.baseParams('alibaba.offer.spec.get', { offerId });
    const data = await this.call(params);
    if (data?.error_code && data.error_code !== 0) return [];
    return data?.result?.specList || data?.specList || [];
  }

  /** 提取 offerId */
  extractOfferId(url: string): string | null {
    const m = url.match(/offer\/(\d+)\.html/) || url.match(/offer(?:%2F|\/)(\d+)/);
    return m ? m[1] : null;
  }

  /** 搜索同款（用于热榜比价） */
  async search1688Alternatives(keyword: string, limit = 5) {
    const results = await this.searchProducts(keyword, 1, limit);
    return results.map(r => ({
      offerId: r.offerId,
      title: r.title,
      priceCny: r.price,
      image: r.image,
      supplier: r.supplier,
      moq: r.moq,
      url: `https://detail.1688.com/offer/${r.offerId}.html`,
    }));
  }

  // ═══════════════════════════════════════════
  //  核心：HTTP 调用 + MD5 签名
  // ═══════════════════════════════════════════

  /** 构建基础参数 */
  private baseParams(method: string, extra: Record<string, any> = {}): Record<string, any> {
    return {
      method,
      app_key: this.appKey,
      timestamp: String(Date.now()),         // 13位毫秒
      format: 'json',
      v: '2.0',
      sign_method: 'md5',
      access_token: this.accessToken,
      ...extra,
    };
  }

  /** 发起 HTTP GET 请求 */
  private async call(params: Record<string, any>): Promise<any> {
    const sign = this.generateSign(params);
    const query = new URLSearchParams({ ...params, sign }).toString();
    const url = `${this.GATEWAY}?${query}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    try { return JSON.parse(text); } catch { return { error_code: -1, error_msg: text }; }
  }

  /**
   * MD5 签名算法（1688 官方规范）
   *
   * 步骤：
   * 1. 所有参数（不含 sign）按 key ASCII 升序排列
   * 2. 拼接格式：app_secret + key1value1 + key2value2 + ... + app_secret
   *    注意：key 和 value 直接相连，无 = 或 & 分隔符！
   * 3. MD5 取结果 → 转大写
   */
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

  // ═══════════════════════════════════════════
  //  辅助
  // ═══════════════════════════════════════════

  private flattenSpecs(specList: any[]): Array<{ name: string; value: string }> {
    if (!Array.isArray(specList) || !specList.length) return [];
    const result: Array<{ name: string; value: string }> = [];
    for (const group of specList) {
      const name = group.name || group.specName || '';
      const values = group.items || group.values || [];
      if (Array.isArray(values)) {
        result.push({ name, value: values.map((v: any) => v.value || v.name || v).join(', ') });
      } else {
        result.push({ name, value: String(values) });
      }
    }
    return result;
  }

  // ═══════════════════════════════════════════
  //  Mock（未配置 API 时）
  // ═══════════════════════════════════════════

  private mockSearch(keyword: string): SearchResult[] {
    return [
      { offerId: 'mock-001', title: `${keyword} 2026新款 韩版潮流`, price: 45, priceUnit: 'CNY', image: '', supplier: '广州服饰源头工厂', moq: 2 },
      { offerId: 'mock-002', title: `${keyword} 跨境热卖 工厂直供`, price: 38.5, priceUnit: 'CNY', image: '', supplier: '义乌小商品批发', moq: 5 },
      { offerId: 'mock-003', title: `${keyword} 高品质 现货速发`, price: 62, priceUnit: 'CNY', image: '', supplier: '深圳电子科技', moq: 1 },
    ];
  }

  private mockDetail(offerId: string): ProductDetail {
    return {
      offerId,
      title: '2026新款韩版宽松T恤 纯棉圆领短袖打底衫',
      price: 45,
      priceRange: { min: 38, max: 52 },
      images: [],
      specifications: [
        { name: '材质', value: '100%纯棉' },
        { name: '尺码', value: 'S/M/L/XL/2XL/3XL' },
        { name: '克重', value: '220g' },
      ],
      moq: 2,
      supplier: { name: '广州服饰源头工厂', location: '广东广州' },
      weight: 0.3,
      weightUnit: 'kg',
    };
  }
}
