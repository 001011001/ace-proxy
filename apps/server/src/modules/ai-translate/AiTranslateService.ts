import { Injectable, Logger } from '@nestjs/common';

interface TranslateRequest {
  sourceText: string;
  sourceLang: 'zh' | 'en' | 'auto';
  targetLang: string;
}

interface TranslateResult {
  original: string;
  translated: string;
  targetLang: string;
}

/**
 * AiTranslateService — AI 翻译上架
 *
 * 将1688/淘宝中文标题和描述自动翻译成目标国家语言。
 * P0 阶段使用 Ollama + Qwen3:4b 本地翻译，零 API 费用。
 * 后期可切换 GPT-4o-mini / DeepL API。
 */
@Injectable()
export class AiTranslateService {
  private readonly logger = new Logger(AiTranslateService.name);

  /** 语言映射 */
  private readonly langMap: Record<string, string> = {
    ID: 'Indonesian',
    TH: 'Thai',
    PH: 'English',
    BR: 'Portuguese',
  };

  /**
   * 翻译单条文本
   */
  async translate(text: string, targetCountry: string): Promise<string> {
    const targetLang = this.langMap[targetCountry.toUpperCase()] || 'English';

    // 使用本地 Ollama Qwen3 翻译
    try {
      const prompt = this.buildTranslatePrompt(text, targetLang);
      const translated = await this.callOllama(prompt);

      if (!translated || translated.length < 3) {
        this.logger.warn(`[Translate] Empty result for "${text.substring(0, 30)}..." → ${targetLang}. Using fallback.`);
        return text; // fallback: 原文
      }

      return translated.trim();
    } catch (e) {
      this.logger.error(`[Translate] Failed: ${e}`);
      return text;
    }
  }

  /**
   * 批量翻译商品上架信息
   * 输出：标题 + 短描述 + 规格属性 + 营销文案
   */
  async translateProductListing(params: {
    title: string;
    description: string;
    specs: string[];
    targetCountry: string;
  }): Promise<{
    title: string;
    description: string;
    specs: string[];
    marketingLine: string;
  }> {
    const targetLang = this.langMap[params.targetCountry.toUpperCase()] || 'English';

    const [title, description, marketingLine] = await Promise.all([
      this.translate(params.title, params.targetCountry),
      this.translate(params.description, params.targetCountry),
      this.generateMarketingLine(params.title, targetLang),
    ]);

    const specs = await Promise.all(
      params.specs.map(s => this.translate(s, params.targetCountry)),
    );

    return { title, description, specs, marketingLine };
  }

  /**
   * 生成营销文案
   */
  private async generateMarketingLine(productName: string, targetLang: string): Promise<string> {
    const prompt = `Write ONE short, catchy marketing line (under 10 words) in ${targetLang} for this product: "${productName}". Make it appealing for cross-border e-commerce shoppers. Only output the line, nothing else.`;
    const result = await this.callOllama(prompt);
    return result?.trim() || productName;
  }

  /**
   * 构建翻译提示词
   */
  private buildTranslatePrompt(text: string, targetLang: string): string {
    return [
      `Translate this product listing from Chinese to natural, fluent ${targetLang}.`,
      `Rules:`,
      `- Keep product terms accurate (size, material, brand names)`,
      `- Use e-commerce friendly language (short, punchy, benefit-focused)`,
      `- Never add invented features or fake specs`,
      `- Currency and numbers stay the same`,
      ``,
      `Input: ${text}`,
      ``,
      `Output in ${targetLang} only:`,
    ].join('\n');
  }

  /**
   * 调用本地 Ollama Qwen3:4b
   */
  private async callOllama(prompt: string): Promise<string> {
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    const MODEL = process.env.OLLAMA_MODEL || 'qwen3:4b';

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.3, num_predict: 512 },
      }),
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.status}`);

    const data = await response.json() as any;
    return data.response || '';
  }
}
