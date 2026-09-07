import { Injectable, Logger } from '@nestjs/common';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * CloudLlmService — 云端 LLM（OpenAI 兼容接口）
 *
 * 为什么需要它：
 * 本地推理（node-llama-cpp + qwen3-4b）占用约 3.1GB 磁盘且翻译质量有限。
 * 改为走云端后：省磁盘、质量更好、无需本地 GPU/CPU 推理。
 *
 * 兼容性：任何 OpenAI 兼容服务均可（OpenAI、智谱 GLM、DeepSeek、Moonshot、
 * 通义、Groq、本地 One-API 聚合等），只需在 .env 配置：
 *   LLM_API_URL=https://<厂商域名>/v1
 *   LLM_API_KEY=<你的 key>
 *   LLM_MODEL=<模型名，可选>
 *
 * 未配置或 URL 为占位值时 isConfigured() 返回 false，调用方自动降级到
 * Ollama / 本地模型，不会影响现有功能。
 */
@Injectable()
export class CloudLlmService {
  private readonly logger = new Logger(CloudLlmService.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor() {
    this.apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || '';
    this.apiUrl = (process.env.LLM_API_URL || '').replace(/\/+$/, '');
    this.model = process.env.LLM_MODEL || 'gpt-4o-mini';
    this.timeoutMs = parseInt(process.env.LLM_TIMEOUT_MS || '30000', 10);
  }

  /**
   * 是否已正确配置云端 LLM。
   * 同时排除 .env 中的示例域名（example.com），避免"配了但其实不可用"。
   */
  isConfigured(): boolean {
    if (!this.apiKey || !this.apiUrl) return false;
    if (!/^https?:\/\//i.test(this.apiUrl)) return false;
    // 占位/示例域名视为未配置
    if (/example\.(com|org|net)/i.test(this.apiUrl)) return false;
    return true;
  }

  /** 纯文本补全（翻译等场景） */
  async completion(
    prompt: string,
    options: { temperature?: number; maxTokens?: number; systemPrompt?: string } = {},
  ): Promise<string | null> {
    const messages: ChatMessage[] = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });
    return this.call(messages, options);
  }

  /** 多轮对话（AI 管家 / 客服场景） */
  async chat(
    messages: ChatMessage[],
    options: { temperature?: number; maxTokens?: number } = {},
  ): Promise<string | null> {
    return this.call(messages, options);
  }

  private async call(
    messages: ChatMessage[],
    options: { temperature?: number; maxTokens?: number },
  ): Promise<string | null> {
    if (!this.isConfigured()) return null;

    const url = `${this.apiUrl}/chat/completions`;
    const body = {
      model: this.model,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 1024,
      stream: false,
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        this.logger.warn(`[CloudLlm] ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
        return null;
      }

      const data: any = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      return typeof content === 'string' && content.trim() ? content.trim() : null;
    } catch (e: any) {
      // 超时/网络错误不应阻断业务 —— 返回 null 由调用方降级
      this.logger.warn(`[CloudLlm] request failed: ${e?.message || e}`);
      return null;
    }
  }
}
