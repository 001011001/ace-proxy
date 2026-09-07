import { Controller, Post, Body, Get, Logger, UseGuards } from '@nestjs/common';
import { AiTranslateService } from './AiTranslateService';
import { TranslateDto, TranslateProductDto } from '../../dto/ai-translate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';

@Controller('translate')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class AiTranslateController {
  private readonly logger = new Logger(AiTranslateController.name);

  constructor(private readonly translate: AiTranslateService) {}

  /**
   * 单条文本翻译
   */
  @Post('text')
  async translateText(@Body() dto: TranslateDto) {
    return { translated: await this.translate.translate(dto.text, dto.targetCountry) };
  }

  /**
   * 商品上架信息完整翻译（标题+描述+规格+营销文案）
   */
  @Post('product')
  async translateProduct(@Body() dto: TranslateProductDto) {
    this.logger.log(`[Translate] Product listing for ${dto.targetCountry}`);
    return this.translate.translateProductListing(dto);
  }

  /**
   * 批量翻译
   */
  @Post('batch')
  async translateBatch(@Body() body: { items: TranslateProductDto[] }) {
    const results = await Promise.all(
      body.items.map(async (item) => ({
        originalTitle: item.title,
        ...(await this.translate.translateProductListing(item)),
      })),
    );
    return results;
  }

  /**
   * 获取支持的语言列表
   */
  @Get('languages')
  getLanguages() {
    return [
      { code: 'ID', name: 'Indonesian', label: '印尼语' },
      { code: 'TH', name: 'Thai', label: '泰语' },
      { code: 'PH', name: 'English', label: '英语（菲律宾）' },
      { code: 'BR', name: 'Portuguese', label: '葡萄牙语（巴西）' },
    ];
  }
}
