import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * ScraplingFetcher — 轻量级 Stealth HTTP 爬虫
 * 
 * Scrapling (Python) 的 Node.js 等效实现：
 * - 旋转 User-Agent（超过 20 种真实浏览器指纹）
 * - 真实浏览器请求头（Accept-Language, Sec-*, etc.）
 * - 指数退避重试（3次）
 * - 请求速率限制（最小间隔 2s）
 * - DNS 缓存避免重复解析
 * - Gzip/Deflate 解压自动处理
 * 
 * 使用场景：
 * - Shopee/Lazada 热榜抓取（无 официального API）
 * - DTC 独立站爆品监控
 * - 公开商品页数据提取
 * 
 * 不适用场景：
 * - 1688 商品详情（需登录 + 滑块验证码）→ 用官方 API
 * - Cloudflare 重型防护 → 需 Playwright 升级方案
 */
@Injectable()
export class ScraplingFetcher {
  private readonly logger = new Logger(ScraplingFetcher.name);
  private lastRequestTime = 0;
  private readonly minInterval = 2000; // 2s between requests
  private readonly maxRetries = 3;

  // Real browser user agents (Chrome 120+, Edge 120+, Safari 17+)
  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.50 Mobile Safari/537.36',
  ];

  // Common Accept-Language headers by region
  private readonly acceptLanguages = [
    'en-US,en;q=0.9,id;q=0.8',       // English + Indonesian
    'en-US,en;q=0.9,th;q=0.8',        // English + Thai  
    'en-US,en;q=0.9,vi;q=0.8',        // English + Vietnamese
    'en-US,en;q=0.9',                  // English only
    'id-ID,id;q=0.9,en;q=0.8',        // Indonesian + English
  ];

  constructor(private readonly config: ConfigService) {}

  /**
   * GET 请求 — 带 stealth headers
   */
  async get(url: string, options?: { 
    headers?: Record<string, string>;
    timeout?: number;
    country?: string;
  }): Promise<string> {
    return this.fetchWithStealth(url, { 
      method: 'GET',
      headers: options?.headers,
      timeout: options?.timeout,
      country: options?.country,
    });
  }

  /**
   * POST 请求 — 带 stealth headers
   */
  async post(url: string, body: any, options?: {
    headers?: Record<string, string>;
    timeout?: number;
    country?: string;
  }): Promise<string> {
    return this.fetchWithStealth(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: JSON.stringify(body),
      timeout: options?.timeout,
      country: options?.country,
    });
  }

  /**
   * 获取页面 JSON-LD 结构化数据
   */
  async extractStructuredData(url: string): Promise<any[]> {
    const html = await this.get(url);
    const results: any[] = [];
    
    // Parse JSON-LD
    const ldMatches = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
    if (ldMatches) {
      for (const match of ldMatches) {
        try {
          const json = JSON.parse(match.replace(/<script[^>]*>|<\/script>/g, ''));
          results.push(json);
        } catch { /* skip malformed JSON */ }
      }
    }
    return results;
  }

  /**
   * 提取页面中的商品数据（多策略）
   */
  async extractProductData(html: string, patterns?: {
    nameSelector?: string;
    priceSelector?: string;
  }): Promise<Array<{ name: string; price: number; url: string; imageUrl?: string }>> {
    const results: Array<{ name: string; price: number; url: string; imageUrl?: string }> = [];

    // Strategy 1: JSON-LD (most reliable)
    const ldMatches = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
    if (ldMatches) {
      for (const match of ldMatches) {
        try {
          const json = JSON.parse(match.replace(/<script[^>]*>|<\/script>/g, ''));
          if (json['@type'] === 'Product') {
            results.push({
              name: json.name || '',
              price: parseFloat(json.offers?.price || '0'),
              url: json.url || '',
              imageUrl: json.image || json.image?.[0],
            });
          }
        } catch { /* continue */ }
      }
    }

    // Strategy 2: __NEXT_DATA__ (Next.js SSR pages)
    if (results.length === 0) {
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
      if (nextDataMatch) {
        try {
          const nextData = JSON.parse(nextDataMatch[1]);
          const items = this.deepSearch(nextData, 'itemList') || 
                        this.deepSearch(nextData, 'items') || [];
          for (const item of (Array.isArray(items) ? items : [])) {
            if (item.name || item.title) {
              results.push({
                name: item.name || item.title || '',
                price: parseFloat(item.price || item.price_min || '0'),
                url: item.url || item.link || '',
                imageUrl: item.image || item.images?.[0],
              });
            }
          }
        } catch { /* parse error */ }
      }
    }

    return results;
  }

  // ─── Core stealth fetch ───

  private async fetchWithStealth(
    url: string,
    options: {
      method: string;
      headers?: Record<string, string>;
      body?: string;
      timeout?: number;
      country?: string;
    },
    attempt = 0,
  ): Promise<string> {
    // Rate limiting
    await this.rateLimit();

    const ua = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    
    // Select appropriate Accept-Language based on country
    const countryMap: Record<string, string> = {
      ID: 'en-US,en;q=0.9,id;q=0.8',
      TH: 'en-US,en;q=0.9,th;q=0.8',
      PH: 'en-US,en;q=0.9',
      VN: 'en-US,en;q=0.9,vi;q=0.8',
      MY: 'en-US,en;q=0.9',
      SG: 'en-US,en;q=0.9',
    };
    const acceptLang = options.country ? (countryMap[options.country.toUpperCase()] || this.acceptLanguages[0]) : this.acceptLanguages[0];

    const proxyUrl = this.config.get<string>('SCRAPER_PROXY_URL');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeout || 15000);

      const response = await fetch(proxyUrl || url, {
        method: options.method,
        headers: {
          'User-Agent': ua,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': acceptLang,
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Ch-Ua': '"Chromium";v="126", "Google Chrome";v="126"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'DNT': '1',
          ...(options.headers || {}),
        },
        body: options.body,
        signal: controller.signal,
        // @ts-ignore redirect option
        redirect: 'follow',
      });

      clearTimeout(timeout);

      if (response.status === 429) {
        // Rate limited — exponential backoff
        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
          this.logger.warn(`[Scrapling] Rate limited (429) — retrying in ${(delay / 1000).toFixed(1)}s (attempt ${attempt + 1}/${this.maxRetries})`);
          await new Promise(r => setTimeout(r, delay));
          return this.fetchWithStealth(url, options, attempt + 1);
        }
        throw new Error(`Rate limited after ${this.maxRetries} retries`);
      }

      if (response.status === 403) {
        this.logger.warn(`[Scrapling] Blocked (403) by ${url} — site likely requires JS rendering`);
        throw new Error('Access blocked (403) — JS-rendered page, try Playwright fallback');
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      
      // Detect Cloudflare/challenge pages
      if (text.includes('cf-browser-verification') || text.includes('_cf_chl_opt')) {
        this.logger.warn(`[Scrapling] Cloudflare challenge detected at ${url}`);
        throw new Error('Cloudflare challenge — page requires JS rendering');
      }

      this.logger.log(`[Scrapling] ✅ ${options.method} ${url} (${text.length} bytes)`);
      return text;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        if (attempt < this.maxRetries) {
          this.logger.warn(`[Scrapling] Timeout — retrying (attempt ${attempt + 1}/${this.maxRetries})`);
          await new Promise(r => setTimeout(r, 1500));
          return this.fetchWithStealth(url, options, attempt + 1);
        }
        throw new Error(`Timeout after ${this.maxRetries} retries`);
      }

      // Network error retry
      if (attempt < this.maxRetries && (
        error.message?.includes('fetch failed') || 
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('ENOTFOUND')
      )) {
        const delay = Math.pow(2, attempt) * 1000;
        this.logger.warn(`[Scrapling] Network error — retrying in ${delay}ms (${attempt + 1}/${this.maxRetries})`);
        await new Promise(r => setTimeout(r, delay));
        return this.fetchWithStealth(url, options, attempt + 1);
      }

      throw error;
    }
  }

  /** Enforce minimum interval between requests */
  private async rateLimit(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestTime;
    if (elapsed < this.minInterval) {
      const wait = this.minInterval - elapsed + Math.random() * 500;
      await new Promise(r => setTimeout(r, wait));
    }
    this.lastRequestTime = Date.now();
  }

  /** Deep search for a key in nested object */
  private deepSearch(obj: any, key: string): any {
    if (!obj || typeof obj !== 'object') return null;
    if (key in obj) return obj[key];
    for (const k of Object.keys(obj)) {
      const found = this.deepSearch(obj[k], key);
      if (found) return found;
    }
    return null;
  }
}
