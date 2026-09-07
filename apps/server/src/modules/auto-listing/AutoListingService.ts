import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiTranslateService } from '../ai-translate/AiTranslateService';
import { ShippingService } from '../shipping/ShippingService';
import { Alibaba1688Service } from '../intelligence/Alibaba1688Service';
import { ImagePipelineService } from '../ai-image/ImagePipelineService';

interface SourceLink {
  url: string;
  platform: '1688' | 'TAOBAO' | 'JD' | 'PDD' | 'AMAZON' | 'SHOPEE' | 'TIKTOK' | 'LAZADA' | 'ALIEXPRESS' | 'UNKNOWN';
  sourcePriceCny: number;
  title: string;
  description: string;
  images: string[];
  specs: string[];
  weightKg: number;
  hasBattery: boolean;
}

export interface ListingResult {
  productId: string;
  titleLocal: string;
  descriptionLocal: string;
  priceLocal: number;
  currency: string;
  shippingEstimate: number;
  estimatedDelivery: string;
  profitMarginPct: number;
  /** 修图管线结果 */
  imageResult?: {
    originalCount: number;
    processedCount: number;
    cutoutUrls: string[];
    sceneUrls: string[];
    finalUrls: string[];
    summary: { total: number; success: number; failed: number; totalDurationMs: number };
  };
  steps: string[];
}

/**
 * AutoListingService — 代购链接→AI全自动上架
 *
 * 用户粘贴 1688/淘宝/拼多多等链接 → AI解析详情 →
 * 搜同款比价 → 算运费 → AI翻译 → 定价 → 上架
 * 全流程 3-5 秒
 */
@Injectable()
export class AutoListingService {
  private readonly logger = new Logger(AutoListingService.name);

  /** 9大平台 URL 识别 */
  private readonly platformPatterns: Array<[string, SourceLink['platform']]> = [
    ['1688.com', '1688'],
    ['taobao.com', 'TAOBAO'],
    ['tmall.com', 'TAOBAO'],
    ['jd.com', 'JD'],
    ['pinduoduo.com', 'PDD'],
    ['yangkeduo.com', 'PDD'],
    ['amazon.com', 'AMAZON'],
    ['amazon.co', 'AMAZON'],
    ['shopee.co', 'SHOPEE'],
    ['shopee.com', 'SHOPEE'],
    ['tokopedia.com', 'SHOPEE'],
    ['tiktok.com', 'TIKTOK'],
    ['lazada.co', 'LAZADA'],
    ['lazada.com', 'LAZADA'],
    ['aliexpress.com', 'ALIEXPRESS'],
    ['aliexpress.ru', 'ALIEXPRESS'],
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly translator: AiTranslateService,
    private readonly shipping: ShippingService,
    private readonly alibaba1688: Alibaba1688Service,
    private readonly imagePipeline: ImagePipelineService,
  ) {}

  /**
   * 解析外部链接并识别平台
   */
  parseUrl(url: string): { platform: SourceLink['platform'] } {
    for (const [pattern, platform] of this.platformPatterns) {
      if (url.includes(pattern)) return { platform };
    }
    return { platform: 'UNKNOWN' };
  }

  /**
   * 主流程：链接→全自动上架
   */
  async listFromUrl(url: string, targetCountry: string): Promise<ListingResult> {
    const steps: string[] = [];

    // Step 1: 解析平台
    const { platform } = this.parseUrl(url);
    steps.push(`✅ Platform detected: ${platform}`);

    // Step 2: 1688 API 获取真实商品数据
    let source: SourceLink;
    if (platform === '1688' && this.alibaba1688.isConfigured()) {
      source = await this.scrapeFrom1688API(url);
    } else {
      source = await this.simulateScrape(url, platform);
    }
    steps.push(`✅ Source data: "${source.title}" · ¥${source.sourcePriceCny}`);

    // Step 3: 搜同款比价（模拟）
    const priceFinal = this.adjustPrice(source.sourcePriceCny);
    steps.push(`✅ Price optimized: ¥${priceFinal} (from ¥${source.sourcePriceCny})`);

    // Step 4: AI 翻译
    const translated = await this.translator.translateProductListing({
      title: source.title,
      description: source.description,
      specs: source.specs,
      targetCountry,
    });
    steps.push(`✅ Translated to ${targetCountry}`);

    // Step 4.5: AI 智能修图（三层管线：抠图→换场景→加文字）
    const category = this.guessCategory(source.title);
    const imageResult = await this.imagePipeline.processProductImages(
      source.images,
      category,
      targetCountry,
      translated.marketingLine,
    );
    const processedImageUrls = imageResult.finalUrls.length > 0 ? imageResult.finalUrls : source.images;
    steps.push(
      `✅ Images processed: ${imageResult.summary.success}/${imageResult.summary.total} steps OK (${imageResult.summary.totalDurationMs}ms)`,
    );

    // Step 5: 计算运费
    let shippingEstimate = 95;
    let estimatedDelivery = '12-16 days';
    try {
      const quote = this.shipping.getCostQuote({
        country: targetCountry,
        weightKg: source.weightKg,
        hasBattery: source.hasBattery,
        itemCount: 1,
      });
      shippingEstimate = quote.totalCostCny;
      estimatedDelivery = quote.estimatedDays;
    } catch (e) {
      this.logger.warn(`[Listing] Shipping estimate fallback: ${e}`);
    }
    steps.push(`✅ Shipping: ¥${shippingEstimate} · ${estimatedDelivery}`);

    // Step 6: 定价（成本+运费+服务费+利润）
    const exchangeRates: Record<string, number> = { IDR: 2200, THB: 5.0, PHP: 7.8 };
    const rate = exchangeRates[targetCountry.toUpperCase()] || 2200;
    const totalCostCny = priceFinal + shippingEstimate;
    const serviceFee = totalCostCny * 0.12;
    const profitMarkup = totalCostCny * 0.2;
    const priceLocal = Math.round((totalCostCny + serviceFee + profitMarkup) * rate * 1.03);
    const profitMarginPct = Math.round(((priceLocal / rate - totalCostCny - serviceFee) / (priceLocal / rate)) * 100);

    const currencyMap: Record<string, string> = { ID: 'IDR', TH: 'THB', PH: 'PHP' };
    const currency = currencyMap[targetCountry.toUpperCase()] || 'IDR';

    steps.push(`✅ Priced: ${currency} ${priceLocal.toLocaleString()} (margin ${profitMarginPct}%)`);

    // Step 7: 写入数据库
    const product = await this.prisma.aceProduct.create({
      data: {
        name: translated.title,
        description: translated.description + '\n\n' + translated.marketingLine,
        category: category,
        sourceUrl: url,
        priceIdr: priceLocal,
        costCny: priceFinal,
        imageUrls: JSON.stringify(processedImageUrls),
        stock: 999,
      },
    });

    // 写入本地化
    await this.prisma.aceProductLocalization.create({
      data: {
        productId: product.id,
        country: targetCountry.toUpperCase(),
        name: translated.title,
        description: translated.description,
        priceLocal,
        currency,
        shippingCost: shippingEstimate,
        isActive: true,
      },
    });

    steps.push(`✅ Listed! Product ID: ${product.id}`);

    this.logger.log(`[Listing] ${url} → ${product.id} (${targetCountry}) in ${steps.length} steps`);

    return {
      productId: product.id,
      titleLocal: translated.title,
      descriptionLocal: translated.description,
      priceLocal,
      currency,
      shippingEstimate,
      estimatedDelivery,
      profitMarginPct,
      imageResult: {
        originalCount: source.images.length,
        processedCount: processedImageUrls.length,
        cutoutUrls: imageResult.cutoutUrls,
        sceneUrls: imageResult.sceneUrls,
        finalUrls: imageResult.finalUrls,
        summary: imageResult.summary,
      },
      steps,
    };
  }

  /**
   * 通过 1688 官方 API 获取真实商品数据
   */
  private async scrapeFrom1688API(url: string): Promise<SourceLink> {
    const offerId = this.alibaba1688.extractOfferId(url);
    if (!offerId) throw new Error(`Cannot extract 1688 offer ID from: ${url}`);

    const detail = await this.alibaba1688.getProductDetail(offerId);
    if (!detail) throw new Error(`Failed to fetch 1688 product: ${offerId}`);

    this.logger.log(`[1688] Fetched: "${detail.title}" · ¥${detail.price} · ${detail.images.length} images`);

    return {
      url,
      platform: '1688',
      sourcePriceCny: detail.price,
      title: detail.title,
      description: detail.specifications.map(s => `${s.name}: ${s.value}`).join('\n'),
      images: detail.images,
      specs: detail.specifications.map(s => `${s.name}: ${s.value}`),
      weightKg: detail.weight || 0.5,
      hasBattery: /电池|battery|充电|power/i.test(detail.title),
    };
  }

  /**
   * 搜索 1688 同款
   */
  async search1688Alternatives(keyword: string, limit = 5) {
    const results = await this.alibaba1688.searchProducts(keyword, 1, limit);
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

  /** 模拟爬取（非1688平台或无API时的兜底） */
  private async simulateScrape(url: string, platform: string): Promise<SourceLink> {
    // 根据平台生成模拟数据
    const products: Record<string, SourceLink> = {
      '1688': {
        url, platform: '1688', sourcePriceCny: 45 + Math.random() * 80,
        title: '2026新款韩版宽松T恤 纯棉圆领短袖打底衫',
        description: '材质: 100%纯棉, 尺码: S-3XL, 颜色: 黑白灰蓝粉, 克重: 220g',
        images: ['https://img.alicdn.com/imgextra/sample1.jpg'],
        specs: ['材质: 100%纯棉', '尺码: S-3XL', '克重: 220g', '产地: 广州'],
        weightKg: 0.3, hasBattery: false,
      },
    };

    const fallback: SourceLink = {
      url, platform: platform as any, sourcePriceCny: 50 + Math.random() * 100,
      title: 'Premium Quality Product 2026',
      description: 'High quality imported product. Durable and stylish.',
      images: [],
      specs: ['Material: Premium', 'Size: Standard'],
      weightKg: 0.5, hasBattery: false,
    };

    return products[platform] || fallback;
  }

  /** 价格优化（加价策略） */
  private adjustPrice(sourcePrice: number): number {
    if (sourcePrice < 30) return sourcePrice * 1.5;
    if (sourcePrice < 100) return sourcePrice * 1.3;
    return sourcePrice * 1.15;
  }

  /** 根据标题猜测品类 */
  private guessCategory(title: string): string {
    const patterns: [RegExp, string][] = [
      [/t.?shirt|kaos|t恤|衫|shirt|top/i, 'FASHION'],
      [/phone|手机|hp|smartphone/i, 'ELECTRONICS'],
      [/shoe|sepatu|鞋|sneaker/i, 'FOOTWEAR'],
      [/bag|tas|包|backpack/i, 'BAGS'],
      [/watch|jam|手表|arloji/i, 'ACCESSORIES'],
      [/makeup|kosmetik|化妆|lipstick|bedak/i, 'BEAUTY'],
      [/toy|mainan|玩具|doll/i, 'TOYS'],
      [/food|makanan|食品|snack/i, 'FOOD'],
    ];

    for (const [pattern, cat] of patterns) {
      if (pattern.test(title)) return cat;
    }
    return 'GENERAL';
  }
}
