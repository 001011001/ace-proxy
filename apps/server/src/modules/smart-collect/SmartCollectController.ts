import { Controller, Post, Body, Logger } from '@nestjs/common';
import { SmartCollectService } from './SmartCollectService';

@Controller('smart-collect')
export class SmartCollectController {
  private readonly logger = new Logger(SmartCollectController.name);

  constructor(private readonly smartCollect: SmartCollectService) {}

  /**
   * POST /api/smart-collect/search
   *
   * 接收任意链接（Shopee/Lazada/Tokopedia/Amazon/1688等）
   * → 提取产品名 → 1688搜同款 → AI合规检查+关税计算 → 返回结果
   */
  @Post('search')
  async search(@Body() body: { url: string; country?: string }) {
    if (!body.url) {
      return { success: false, error: 'URL is required' };
    }

    this.logger.log(`[SmartCollect] Search request: ${body.url}`);

    try {
      const result = await this.smartCollect.search({
        url: body.url,
        country: body.country || 'ID',
      });
      return { success: true, data: result };
    } catch (e: any) {
      this.logger.error(`[SmartCollect] Search failed: ${e.message}`);
      return {
        success: false,
        error: e.message || 'Search failed',
        fallback: true,
      };
    }
  }

  /**
   * POST /api/smart-collect/enrich
   *
   * 单个产品的AI增强（合规检查+关税+印尼语翻译）
   */
  @Post('enrich')
  async enrich(@Body() body: { name: string; priceCny: number; priceIdr?: number; country?: string }) {
    if (!body.name) {
      return { success: false, error: 'Product name is required' };
    }

    const logistics = this.smartCollect.checkLogistics(body.name);
    const priceIdr = body.priceIdr || Math.round((body.priceCny || 0) * 2250);
    const customs = this.smartCollect.calcCustoms(priceIdr);

    return {
      success: true,
      data: { logistics, customs },
    };
  }
}
