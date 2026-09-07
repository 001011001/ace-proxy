import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * IPFirewallService — 视觉防火墙 (Vision AI Powered)
 *
 * 利用 GPT-4o-vision / Google Vision API 实现：
 * 1. 品牌 Logo 检测 — 拦截商标侵权产品
 * 2. 视觉相似度比对 — 拦截外观专利高仿产品
 *
 * 架构：支持双后端
 * - OpenAI GPT-4o-vision (OPENAI_API_KEY 配置时优先)
 * - 本地 Ollama + LLaVA (fallback)
 */
@Injectable()
export class IPFirewallService {
  private readonly logger = new Logger(IPFirewallService.name);

  /** 知名品牌 Logo 描述（用于 Vision AI prompt） */
  private static readonly BRAND_PATTERNS = [
    'Nike swoosh logo', 'Adidas three stripes', 'Louis Vuitton monogram',
    'Gucci double G', 'Chanel interlocking CC', 'Hermès H logo',
    'Rolex crown', 'Apple logo', 'Samsung logo', 'Dior pattern',
    'Balenciaga logo', 'Supreme box logo', 'Off-White arrow logo',
    'Prada logo', 'Fendi FF pattern', 'Burberry check pattern',
    'Disney characters', 'Hello Kitty', 'Pokémon characters',
    'LEGO logo', 'Barbie logo',
  ];

  /** 高仿外观专利产品的视觉描述（用于 Vision AI prompt） */
  private static readonly PATENT_PATTERNS = [
    'unique product shape or silhouette', 'distinctive packaging design',
    'characteristic product curvature', 'iconic product proportion',
    'registered design patent elements',
  ];

  constructor(private readonly config: ConfigService) {}

  /**
   * 评估产品风险（对外入口）
   * @param imageUrl 产品图片 URL
   */
  async evaluateRisk(imageUrl: string) {
    const provider = this.getProvider();
    this.logger.log(`[IP-Firewall] Evaluating risk for ${imageUrl} via ${provider}`);

    // 1. Vision AI 品牌 Logo 扫描
    const brandResult = await this.detectBrandLogo(imageUrl);
    if (brandResult.detected) {
      this.logger.warn(`[IP-Firewall] BLOCKED — Brand infringement: ${brandResult.brand} in ${imageUrl}`);
      return {
        action: 'BLOCK' as const,
        reason: 'TRADEMARK_INFRINGEMENT',
        detail: { brand: brandResult.brand, confidence: brandResult.confidence },
        provider,
      };
    }

    // 2. Vision AI 外观专利相似度比对
    const similarity = await this.calculateVisualSimilarity(imageUrl);

    if (similarity.score > 0.85) {
      this.logger.warn(`[IP-Firewall] WARN — Design patent similarity ${similarity.score} for ${imageUrl}`);
      return {
        action: 'WARN' as const,
        level: 'YELLOW_ZONE' as const,
        reason: 'DESIGN_PATENT_RISK',
        detail: { score: similarity.score, matchedPatterns: similarity.matchedPatterns },
        provider,
      };
    }

    this.logger.log(`[IP-Firewall] PASS — ${imageUrl} clear`);
    return {
      action: 'PASS' as const,
      detail: { score: similarity.score },
      provider,
    };
  }

  /**
   * 检测品牌 Logo — 调用 Vision AI
   */
  private async detectBrandLogo(imageUrl: string): Promise<{
    detected: boolean;
    brand?: string;
    confidence?: number;
  }> {
    const prompt = `Analyze this product image. Does it contain any of these brand logos or trademarked designs: ${IPFirewallService.BRAND_PATTERNS.join(', ')}?
Respond with JSON only: {"detected": true/false, "brand": "brand name if detected", "confidence": 0-100}`;

    try {
      const result = await this.callVisionAI(imageUrl, prompt);
      const parsed = this.parseJsonResponse(result);
      return {
        detected: parsed?.detected === true,
        brand: parsed?.brand,
        confidence: parsed?.confidence,
      };
    } catch (e) {
      this.logger.error(`[IP-Firewall] Vision AI call failed for brand detection: ${e}`);
      // Safe fallback: 不拦截（宁可漏检也不误杀）
      return { detected: false };
    }
  }

  /**
   * 计算视觉相似度 — 与已知外观专利模式比对
   */
  private async calculateVisualSimilarity(imageUrl: string): Promise<{
    score: number;
    matchedPatterns: string[];
  }> {
    const prompt = `Analyze this product image for design patent infringement risk. Consider: ${IPFirewallService.PATENT_PATTERNS.join(', ')}.
Rate the similarity to known registered designs on a scale of 0 to 1.
Respond with JSON only: {"score": 0.0-1.0, "matchedPatterns": ["pattern1", "pattern2"], "analysis": "brief explanation"}`;

    try {
      const result = await this.callVisionAI(imageUrl, prompt);
      const parsed = this.parseJsonResponse(result);
      return {
        score: typeof parsed?.score === 'number' ? parsed.score : 0,
        matchedPatterns: Array.isArray(parsed?.matchedPatterns) ? parsed.matchedPatterns : [],
      };
    } catch (e) {
      this.logger.error(`[IP-Firewall] Vision AI call failed for similarity check: ${e}`);
      return { score: 0, matchedPatterns: [] };
    }
  }

  /**
   * 调用 Vision AI 后端
   * 优先级：OpenAI GPT-4o-vision > Ollama LLaVA > Mock fallback
   */
  private async callVisionAI(imageUrl: string, prompt: string): Promise<string> {
    const provider = this.getProvider();

    if (provider === 'openai') {
      return this.callOpenAIVision(imageUrl, prompt);
    }

    if (provider === 'ollama') {
      return this.callOllamaVision(imageUrl, prompt);
    }

    // Mock fallback — 开发环境安全默认值
    this.logger.warn('[IP-Firewall] No Vision AI configured — using safe mock (PASS)');
    return JSON.stringify({ detected: false, score: 0.12, matchedPatterns: [], analysis: 'mock' });
  }

  /**
   * OpenAI GPT-4o-vision 调用
   */
  private async callOpenAIVision(imageUrl: string, prompt: string): Promise<string> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    const baseUrl = this.config.get<string>('OPENAI_BASE_URL') || 'https://api.openai.com/v1';

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI Vision API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content || '{}';
  }

  /**
   * Ollama + LLaVA 调用
   */
  private async callOllamaVision(imageUrl: string, prompt: string): Promise<string> {
    const ollamaUrl = this.config.get<string>('OLLAMA_URL') || 'http://localhost:11434';
    const model = this.config.get<string>('OLLAMA_VISION_MODEL') || 'llava:latest';

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        images: [imageUrl],
        stream: false,
        options: { temperature: 0.1 },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama Vision API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    return data.response || '{}';
  }

  /**
   * 判断当前可用的 Vision AI 提供商
   */
  private getProvider(): 'openai' | 'ollama' | 'mock' {
    if (this.config.get<string>('OPENAI_API_KEY')) {
      return 'openai';
    }
    if (this.config.get<string>('OLLAMA_URL')) {
      return 'ollama';
    }
    return 'mock';
  }

  /**
   * 安全解析 JSON 响应（处理 AI 返回非标准格式）
   */
  private parseJsonResponse(text: string): Record<string, any> | null {
    try {
      // 尝试直接解析
      return JSON.parse(text);
    } catch {
      // 尝试提取 JSON 块（AI 可能包裹在 ```json ... ``` 中）
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch { /* fall through */ }
      }
      // 尝试提取花括号内容
      const braceMatch = text.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        try {
          return JSON.parse(braceMatch[0]);
        } catch { /* fall through */ }
      }
      return null;
    }
  }
}
