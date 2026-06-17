import { Injectable, Logger } from '@nestjs/common';
import { Alibaba1688Service } from '../intelligence/Alibaba1688Service';
import { UnifiedSourcingService, UnifiedProduct } from '../intelligence/UnifiedSourcingService';
import { ShippingService } from '../shipping/ShippingService';

// ─── Types ───────────────────────────────────────────────

export interface SourcingResult {
  id: string;
  name: string;
  nameId: string;
  priceCny: number;
  priceIdr: number;
  image: string;
  /** Source platform: 1688 | JD | TAOBAO */
  source: string;
  /** Supplier name */
  supplier: string;
  /** Source URL */
  sourceUrl: string;
  /** Min order quantity */
  moq: number;
  /** Commission rate (for JD/Taobao affiliates) */
  commissionRate?: number;
  /** Logistics compliance result */
  logistics: LogisticsInfo;
  /** Customs / tax calculation */
  customs: CustomsInfo;
  /** AI-generated selling advice */
  aiAdvice?: string;
  /** Shipping estimate (cost in CNY) */
  shippingEstimate: number;
  /** Estimated delivery days */
  deliveryDays: string;
}

export interface LogisticsInfo {
  status: 'ok' | 'special' | 'banned';
  label: string;
  labelId: string;
  warning?: string;
  warningId?: string;
  surcharge?: string;
  channel: string;
}

export interface CustomsInfo {
  taxable: boolean;
  duty: number;
  vat: number;
  total: number;
  note: string;
  noteId: string;
}

interface SearchRequest {
  url: string;
  country?: string;
}

// ─── Constants ───────────────────────────────────────────

/** 印尼基础信息 */
const IDR_RATE = 2250; // 1 CNY ≈ 2,250 IDR (2026-06)
const CUSTOMS_FREE = 500000; // IDR 500K 免税额
const DUTY_RATE = 0.075; // 7.5% 关税
const VAT_RATE = 0.11; // 11% VAT

/** 物流合规关键词（与前端 SmartCollect.LOGISTICS_DB 对齐） */
const LOGISTICS_RULES = {
  banned: [
    { kw: ['松散电池','loose battery','battery pack','18650','26650','power bank'], label: '🚫 Dilarang (Baterai Lepas)', labelId: '🚫 Tidak Bisa Dikirim', warning: 'Baterai lepas dilarang jalur udara (IATA DGR)', warningId: 'Baterai lepas dilarang lewat jalur udara (IATA DGR)' },
    { kw: ['打火机','lighter','korek','zippo','fuel'], label: '🚫 Dilarang (Korek Api)', labelId: '🚫 Tidak Bisa Dikirim', warning: 'Korek api berbahan bakar dilarang', warningId: 'Korek api berbahan bakar dilarang' },
    { kw: ['武器','weapon','gun','bullet','ammo','senjata','peluru'], label: '🚫 Dilarang (Senjata)', labelId: '🚫 Tidak Bisa Dikirim', warning: 'Senjata & amunisi mutlak dilarang', warningId: 'Senjata & amunisi mutlak dilarang' },
    { kw: ['毒品','narcotics','narkoba','ganja','cannabis'], label: '🚫 Dilarang (Narkoba)', labelId: '🚫 Tidak Bisa Dikirim', warning: 'Narkoba dilarang keras', warningId: 'Narkoba dilarang keras - ancaman hukuman mati' },
    { kw: ['易燃','inflammable','gas','aerosol','hairspray'], label: '🚫 Dilarang (Gas)', labelId: '🚫 Tidak Bisa Dikirim', warning: 'Gas mudah terbakar dilarang', warningId: 'Gas mudah terbakar dilarang udara' },
    { kw: ['色情','porn','xxx','adult'], label: '🚫 Dilarang (Konten)', labelId: '🚫 Tidak Bisa Dikirim', warning: 'Konten pornografi ilegal di Indonesia', warningId: 'Konten pornografi ilegal di Indonesia' },
  ],
  special: [
    { kw: ['内置电池','built-in battery','powerbank','充电宝'], label: '⚠️ Perlu Penanganan', labelId: '⚠️ Perlu Penanganan Khusus', warning: 'Baterai internal butuh jalur khusus (PI966/PI967)', warningId: 'Baterai internal butuh jalur khusus (PI966/PI967)', surcharge: 'Rp 25.000-50.000' },
    { kw: ['玻璃','glass','kaca','ceramic','keramik','porcelain'], label: '⚠️ Perlu Penanganan', labelId: '⚠️ Perlu Penanganan Khusus', warning: 'Barang pecah belah butuh kemasan khusus', warningId: 'Barang pecah belah butuh kemasan khusus', surcharge: 'Rp 15.000-25.000' },
    { kw: ['香水','perfume','parfum','liquid','cairan','液体'], label: '⚠️ Perlu Penanganan', labelId: '⚠️ Perlu Penanganan Khusus', warning: 'Cairan maks 100ml/botol via udara', warningId: 'Cairan maks 100ml/botol via udara, lebih dari itu harus laut', surcharge: 'Sea freight if >100ml' },
    { kw: ['食品','makanan','snack','candy','permen','cookie','biscuit'], label: '⚠️ Perlu Penanganan', labelId: '⚠️ Perlu Penanganan Khusus', warning: 'Makanan butuh izin BPOM', warningId: 'Makanan butuh izin BPOM, personal use <5kg bebas', surcharge: 'BPOM permit for commercial' },
    { kw: ['化妆品','kosmetik','skincare','serum','cream','krim','lotion'], label: '⚠️ Perlu Penanganan', labelId: '⚠️ Perlu Penanganan Khusus', warning: 'Kosmetik butuh registrasi BPOM', warningId: 'Kosmetik butuh registrasi BPOM (komersial)', surcharge: 'BPOM registration for resale' },
    { kw: ['药品','obat','medicine','supplement','vitamin'], label: '⚠️ Perlu Penanganan', labelId: '⚠️ Perlu Penanganan Khusus', warning: 'Obat butuh izin Kemenkes', warningId: 'Obat butuh izin Kemenkes, kegunaan pribadi 30 hari boleh', surcharge: 'Kemenkes permit for commercial' },
    { kw: ['品牌','branded','nike','adidas','gucci','lv','louis vuitton'], label: '⚠️ Perlu Penanganan', labelId: '⚠️ Perlu Penanganan Khusus', warning: 'Produk bermerek butuh bukti otorisasi', warningId: 'Produk bermerek butuh bukti otorisasi merek', surcharge: 'Brand authorization required' },
  ],
};

/**
 * SmartCollectService — 海外链接 → 1688搜索 → AI合规+关税 → 真实结果
 *
 * 用户粘贴任意海外商城链接（Shopee/Lazada/Tokopedia/Amazon等）
 * → 提取产品名 → 1688 API搜同款 → AI检查物流合规+计算关税
 * → 返回前端展示
 */
@Injectable()
export class SmartCollectService {
  private readonly logger = new Logger(SmartCollectService.name);
  private readonly OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

  constructor(
    private readonly alibaba1688: Alibaba1688Service,
    private readonly unifiedSourcing: UnifiedSourcingService,
    private readonly shipping: ShippingService,
  ) {}

  // ═══════════════════════════════════════════
  //  主入口：搜索同款
  // ═══════════════════════════════════════════

  async search(req: SearchRequest): Promise<{
    url: string;
    sourcePlatform: string;
    extractedName: string;
    totalFound: number;
    products: SourcingResult[];
    shippingChannels: Array<{ name: string; nameId: string; transit: string; price: string }>;
    customsNote: string;
  }> {
    const { url } = req;
    const country = req.country || 'ID';

    // Step 1: Extract product name from URL
    const extracted = await this.extractProductName(url);
    this.logger.log(`[SmartCollect] Extracted: "${extracted.name}" from ${extracted.platform}`);

    // Step 2: Search 1688 + JD + Taobao（三平台聚合）
    const unifiedResults = await this.unifiedSourcing.searchAll(extracted.name, 6);
    this.logger.log(`[SmartCollect] Found ${unifiedResults.length} products across 3 platforms`);

    // Convert to legacy format for downstream processing
    const results = unifiedResults.map(r => ({
      offerId: r.id,
      title: r.name,
      price: r.priceCny,
      image: r.image,
      supplier: r.supplier,
      moq: r.moq,
      source: r.source,
      sourceUrl: r.sourceUrl,
      commissionRate: r.commissionRate,
    }));

    // Step 3: Try AI enrichment (non-blocking, graceful degrade)
    const aiEnriched = await this.tryAiEnrich(results, extracted.name, country);

    // Step 4: Build sourcing results with logistics + customs
    const products: SourcingResult[] = results.map((r, i) => {
      const logistics = this.checkLogistics(r.title);
      const priceIdr = Math.round(r.price * IDR_RATE);
      const customs = this.calcCustoms(priceIdr);
      const aiExtra = aiEnriched?.[i];

      // Shipping estimate
      let shippingEstimate = 45; // default ¥45 for 0.5kg
      let deliveryDays = '12-16 hari';
      try {
        const quote = this.shipping.getCostQuote({
          country,
          weightKg: 0.5,
          hasBattery: logistics.status === 'special' && /battery|baterai/i.test(r.title),
          itemCount: 1,
        });
        shippingEstimate = quote.totalCostCny;
        deliveryDays = quote.estimatedDays;
      } catch {}

      const shipping = this.pickBestChannel(logistics);

      return {
        id: `sc-${r.offerId}`,
        name: r.title,
        nameId: aiExtra?.nameId || this.simpleTranslate(r.title),
        priceCny: r.price,
        priceIdr,
        image: r.image || '',
        supplier: r.supplier || 'Supplier Terverifikasi',
        source: (r as any).source || '1688',
        sourceUrl: (r as any).sourceUrl || `https://detail.1688.com/offer/${r.offerId}.html`,
        moq: r.moq || 1,
        logistics,
        customs,
        aiAdvice: aiExtra?.advice,
        shippingEstimate,
        deliveryDays,
      };
    });

    return {
      url,
      sourcePlatform: extracted.platform,
      extractedName: extracted.name,
      totalFound: products.length,
      products,
      shippingChannels: this.getChannels(),
      customsNote:
        '📋 Nilai ≤Rp 500.000 bebas bea masuk. Di atas itu kena bea masuk 7.5% + PPN 11%. Deklarasi nilai harus akurat.',
    };
  }

  // ═══════════════════════════════════════════
  //  产品名提取（海外链接）
  // ═══════════════════════════════════════════

  private async extractProductName(url: string): Promise<{ name: string; platform: string }> {
    const platform = this.identifyPlatform(url);

    try {
      // Try to fetch the page and extract title
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        },
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const html = await res.text();

      // Strategy 1: og:title meta tag (most reliable across platforms)
      let name = '';
      const ogTitleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)
        || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:title"/i);
      if (ogTitleMatch) {
        name = this.cleanProductName(ogTitleMatch[1]);
      }

      // Strategy 2: <title> tag
      if (!name) {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          name = this.cleanProductName(titleMatch[1]);
        }
      }

      // Strategy 3: <h1>
      if (!name) {
        const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1Match) name = this.cleanProductName(h1Match[1]);
      }

      if (name) {
        return { name, platform };
      }
    } catch (e: any) {
      this.logger.warn(`[SmartCollect] Failed to fetch URL: ${e.message}`);
    }

    // Fallback: extract from URL path
    const fallbackName = this.extractNameFromUrl(url);
    return { name: fallbackName, platform };
  }

  /** 从URL路径提取产品名（兜底） */
  private extractNameFromUrl(url: string): string {
    try {
      const u = new URL(url);
      const pathParts = u.pathname.split('/').filter(Boolean);
      // Get the last meaningful segment
      const last = pathParts[pathParts.length - 1] || '';
      return last.replace(/[-_.]/g, ' ').replace(/[0-9]+/g, '').trim() || 'Product';
    } catch {
      return 'Product';
    }
  }

  /** 清理产品名（去平台后缀、SEO垃圾） */
  private cleanProductName(raw: string): string {
    return raw
      .replace(/\s*[-–|]\s*(Shopee|Lazada|Tokopedia|Amazon|Bukalapak|TikTok|AliExpress).*/gi, '')
      .replace(/\s*[-–|]\s*(Indonesia|Malaysia|Philippines|Thailand|Vietnam).*/gi, '')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 120);
  }

  /** 简单翻译（非AI模式兜底） */
  private simpleTranslate(name: string): string {
    const map: Record<string, string> = {
      't-shirt': 'Kaos', 'shirt': 'Kemeja', 'dress': 'Gaun', 'bag': 'Tas',
      'shoes': 'Sepatu', 'watch': 'Jam Tangan', 'phone': 'Handphone',
      'case': 'Casing', 'charger': 'Pengisi Daya', 'cable': 'Kabel',
      'lamp': 'Lampu', 'fan': 'Kipas', 'toy': 'Mainan', 'doll': 'Boneka',
      'mug': 'Gelas', 'cup': 'Cangkir', 'mat': 'Alas', 'carpet': 'Karpet',
      'curtain': 'Gorden', 'pillow': 'Bantal', 'blanket': 'Selimut',
      'hijab': 'Hijab', 'mukena': 'Mukena', 'prayer': 'Sajadah',
      'necklace': 'Kalung', 'ring': 'Cincin', 'bracelet': 'Gelang',
      'earring': 'Anting', 'hat': 'Topi', 'scarf': 'Syal',
      'wallet': 'Dompet', 'belt': 'Ikat Pinggang', 'sandal': 'Sandal',
      'sneaker': 'Sepatu Olahraga', 'jacket': 'Jaket', 'hoodie': 'Hoodie',
      'pants': 'Celana', 'skirt': 'Rok', 'socks': 'Kaus Kaki',
    };
    let result = name;
    for (const [en, id] of Object.entries(map)) {
      result = result.replace(new RegExp(en, 'gi'), id);
    }
    // Prefix with category indicator
    if (!/[a-zA-Z]/.test(result) || result === name) {
      result = 'Produk ' + result;
    }
    return result.substring(0, 80);
  }

  private identifyPlatform(url: string): string {
    const patterns: [string, string][] = [
      ['shopee', 'Shopee'], ['lazada', 'Lazada'], ['tokopedia', 'Tokopedia'],
      ['bukalapak', 'Bukalapak'], ['blibli', 'Blibli'],
      ['amazon', 'Amazon'], ['aliexpress', 'AliExpress'],
      ['tiktok', 'TikTok Shop'], ['temu', 'Temu'],
      ['ebay', 'eBay'], ['walmart', 'Walmart'],
      ['1688', '1688.com'], ['taobao', 'Taobao'],
      ['tmall', 'Tmall'], ['jd.com', 'JD.com'],
      ['pinduoduo', 'Pinduoduo'],
    ];
    for (const [key, name] of patterns) {
      if (url.toLowerCase().includes(key)) return name;
    }
    return 'External';
  }

  // ═══════════════════════════════════════════
  //  物流合规检查
  // ═══════════════════════════════════════════

  checkLogistics(name: string): LogisticsInfo {
    const lower = name.toLowerCase();

    // Check banned
    for (const rule of LOGISTICS_RULES.banned) {
      for (const k of rule.kw) {
        if (lower.includes(k.toLowerCase())) {
          return {
            status: 'banned',
            label: rule.label,
            labelId: rule.labelId,
            warning: rule.warning,
            warningId: rule.warningId,
            channel: '—',
          };
        }
      }
    }

    // Check special
    for (const rule of LOGISTICS_RULES.special) {
      for (const k of rule.kw) {
        if (lower.includes(k.toLowerCase())) {
          return {
            status: 'special',
            label: rule.label,
            labelId: rule.labelId,
            warning: rule.warning,
            warningId: rule.warningId,
            surcharge: rule.surcharge,
            channel: 'J&T Express / Cainiao · 7-18 hari',
          };
        }
      }
    }

    // Default OK
    return {
      status: 'ok',
      label: '✅ Dapat Dikirim',
      labelId: '✅ Bisa Dikirim',
      channel: 'J&T Express / JNE / Cainiao · 5-18 hari',
    };
  }

  /** 根据品类推荐最佳物流渠道 */
  private pickBestChannel(logistics: LogisticsInfo): string {
    if (logistics.status === 'banned') return '—';
    if (logistics.status === 'special') return logistics.channel;
    return 'J&T Express (5-8 hari) atau Cainiao Ekonomi (12-18 hari)';
  }

  // ═══════════════════════════════════════════
  //  关税计算
  // ═══════════════════════════════════════════

  calcCustoms(priceIdr: number, weightKg = 0.5): CustomsInfo {
    if (priceIdr <= CUSTOMS_FREE) {
      return {
        taxable: false,
        duty: 0,
        vat: 0,
        total: 0,
        note: '✅ Di bawah Rp 500.000 — bebas bea masuk & PPN',
        noteId: '✅ Di bawah Rp 500.000 — bebas bea masuk & PPN',
      };
    }

    const duty = Math.round(priceIdr * DUTY_RATE);
    const vat = Math.round((priceIdr + duty) * VAT_RATE);
    const total = duty + vat;

    return {
      taxable: true,
      duty,
      vat,
      total,
      note: `⚠️ Kena bea masuk ≈Rp ${duty.toLocaleString('id-ID')} + PPN ≈Rp ${vat.toLocaleString('id-ID')}`,
      noteId: `⚠️ Kena bea masuk ≈Rp ${duty.toLocaleString('id-ID')} + PPN ≈Rp ${vat.toLocaleString('id-ID')}`,
    };
  }

  // ═══════════════════════════════════════════
  //  AI 增强（合规+关税+翻译）
  // ═══════════════════════════════════════════

  private async tryAiEnrich(
    products: Array<{ title: string; price: number }>,
    searchQuery: string,
    country: string,
  ): Promise<Array<{ nameId?: string; advice?: string }> | null> {
    try {
      const prompt = `You are a cross-border e-commerce logistics expert for Indonesia.

Given the following products found on 1688.com (Chinese wholesale platform), analyze EACH product for shipping to Indonesia:

Products:
${products.map((p, i) => `${i + 1}. "${p.title}" — ¥${p.price} CNY`).join('\n')}

For EACH product, return a JSON array with these fields:
- index: number (product number, starting from 1)
- nameId: Indonesian-friendly product name (keep it short, max 50 chars)
- logisticsStatus: "ok" | "special" | "banned"
- logisticsReason: brief reason in Indonesian (max 50 chars)
- canShip: true/false
- customsRisk: "low" | "medium" | "high"
- sellingAdvice: brief selling advice in Indonesian (max 80 chars)

Return ONLY a valid JSON array. No markdown, no explanation.

Example output:
[{"index":1,"nameId":"Tas Ransel Premium","logisticsStatus":"ok","logisticsReason":"Produk tekstil - aman dikirim","canShip":true,"customsRisk":"low","sellingAdvice":"Sangat diminati pelajar & mahasiswa Indonesia"}]`;

      const res = await fetch(`${this.OLLAMA_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'qwen3:4b',
          prompt,
          stream: false,
          options: { temperature: 0.1, num_predict: 1024 },
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);

      const data = await res.json();
      const text = data.response?.trim() || '';

      // Extract JSON array from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed)) return null;

      // Map back to product indices
      const enriched: Array<{ nameId?: string; advice?: string }> = [];
      for (const item of parsed) {
        if (item.index && item.index <= products.length) {
          enriched[item.index - 1] = {
            nameId: item.nameId,
            advice: item.sellingAdvice,
          };
        }
      }
      return enriched;
    } catch (e: any) {
      this.logger.warn(`[SmartCollect] AI enrich skipped: ${e.message}`);
      return null;
    }
  }

  // ═══════════════════════════════════════════
  //  物流渠道
  // ═══════════════════════════════════════════

  private getChannels() {
    return [
      { name: 'J&T Express', nameId: 'J&T Express', transit: '5-8 hari', price: 'Rp 45.000-75.000/kg' },
      { name: 'JNE International', nameId: 'JNE International', transit: '7-10 hari', price: 'Rp 50.000-85.000/kg' },
      { name: 'Cainiao Super Economy', nameId: 'Cainiao Ekonomi', transit: '12-18 hari', price: 'Rp 25.000-40.000/kg' },
      { name: 'Sea Freight LCL', nameId: 'Kargo Laut', transit: '18-25 hari', price: 'Rp 15.000-25.000/kg' },
    ];
  }
}
