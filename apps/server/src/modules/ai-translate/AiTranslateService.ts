import { Injectable, Logger } from '@nestjs/common';
import { LocalLlmService } from '../llm/LocalLlmService';
import { CloudLlmService } from '../llm/CloudLlmService';

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
 * 支持两种后端：
 * 1. Ollama HTTP — 当 OLLAMA_URL 环境变量已配置时使用
 * 2. LocalLlmService (node-llama-cpp) — 默认使用进程内推理，零外部依赖
 */
@Injectable()
export class AiTranslateService {
  private readonly logger = new Logger(AiTranslateService.name);
  private readonly OLLAMA_URL = process.env.OLLAMA_URL || '';
  private readonly OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:4b';

  /** 语言映射 */
  private readonly langMap: Record<string, string> = {
    ID: 'Indonesian',
    TH: 'Thai',
    PH: 'English',
    BR: 'Portuguese',
  };

  constructor(
    private readonly localLlm: LocalLlmService,
    private readonly cloudLlm: CloudLlmService,
  ) {}

  /**
   * 翻译单条文本
   */
  async translate(text: string, targetCountry: string): Promise<string> {
    const targetLang = this.langMap[targetCountry.toUpperCase()] || 'English';

    try {
      const prompt = this.buildTranslatePrompt(text, targetLang);
      const translated = await this.callLlm(prompt);

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
    const result = await this.callLlm(prompt);
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
   * Call LLM — dispatches to Ollama (if configured) or LocalLlmService.
   */
  private async callLlm(prompt: string): Promise<string | null> {
    // ① 云端 LLM（需在 .env 配置真实 LLM_API_URL + LLM_API_KEY）
    //    优先云端：省去本地 ~3.1GB 模型，且翻译质量优于 4B 量化模型。
    //    CloudLlmService 内部失败会返回 null，此处自动降级，不阻断业务。
    if (this.cloudLlm.isConfigured()) {
      const cloud = await this.cloudLlm.completion(prompt, {
        temperature: 0.3,
        maxTokens: 512,
      });
      if (cloud) return cloud;
      // 云端返回空 → 继续走下方降级链路
    }

    // ② Ollama (HTTP) — 若显式配置了 OLLAMA_URL
    if (this.OLLAMA_URL) {
      return this.callOllama(prompt);
    }

    // ③ 本地模型 node-llama-cpp（进程内推理，作为最后手段）
    return this.callLocalLlm(prompt);
  }

  /**
   * 调用本地 Ollama Qwen3（original implementation, kept for backward compat）
   */
  private async callOllama(prompt: string): Promise<string> {
    const response = await fetch(`${this.OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.3, num_predict: 512 },
      }),
    });

    if (!response.ok) throw new Error(`Ollama error: ${response.status}`);

    const data = await response.json() as any;
    return data.response || '';
  }

  /**
   * 调用 LocalLlmService (node-llama-cpp 进程内推理)
   */
  private async callLocalLlm(prompt: string): Promise<string | null> {
    const result = await this.localLlm.completion(prompt, {
      temperature: 0.3,
      maxTokens: 512,
    });
    return result;
  }
}
