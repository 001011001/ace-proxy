import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

/**
 * Options for completion calls (simple text-in → text-out).
 */
export interface CompletionOptions {
  /** Sampling temperature (0 = deterministic, 1 = creative). Default: 0.3 */
  temperature?: number;
  /** Maximum tokens to generate. Default: 512 */
  maxTokens?: number;
  /** Top-p (nucleus) sampling. Default: 0.9 */
  topP?: number;
}

/**
 * Options for chat calls (multi-turn with system prompt).
 */
export interface ChatOptions {
  /** System prompt injected before the conversation. */
  systemPrompt?: string;
  /** Sampling temperature. Default: 0.7 */
  temperature?: number;
  /** Maximum tokens to generate. Default: 256 */
  maxTokens?: number;
  /** Top-p sampling. Default: 0.9 */
  topP?: number;
  /** Tool definitions to embed in the prompt (for local models without native function calling). */
  tools?: ToolDefinition[];
}

/**
 * A single message in a chat conversation.
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  /** For assistant messages that trigger a tool call. */
  toolCalls?: ToolCall[];
  /** For tool-result messages. */
  name?: string;
}

/**
 * Result from a chat call.
 */
export interface ChatResult {
  /** The text content of the assistant's reply. */
  content: string;
  /** Parsed tool calls, if any. */
  toolCalls: ToolCall[];
}

/**
 * A function/tool definition (simplified OpenAI-style).
 */
export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, { type: string; description: string }>;
      required?: string[];
    };
  };
}

/**
 * A parsed tool call from the model output.
 */
export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

/**
 * LocalLlmService — Shared in-process LLM inference engine.
 *
 * Uses `node-llama-cpp` to load a `.gguf` model directly within the Node.js
 * process. This eliminates the need for an external Ollama daemon.
 *
 * Design:
 * - **Lazy loading**: Model is loaded on first inference call, not at startup.
 * - **Singleton**: A single model instance is shared across all consumers.
 * - **Graceful degradation**: If the model file is missing or loading fails,
 *   `isAvailable()` returns false and all calls return null/empty results.
 * - **Backward compatible**: If OLLAMA_URL env var is set, the caller can
 *   choose to use Ollama instead (this service does not enforce exclusivity).
 */
@Injectable()
export class LocalLlmService implements OnModuleDestroy {
  private readonly logger = new Logger(LocalLlmService.name);

  /** Path to the .gguf model file on disk. */
  private readonly modelPath: string;

  /** Number of GPU layers to offload (0 = CPU only). */
  private readonly gpuLayers: number;

  /** Context window size in tokens. */
  private readonly contextSize: number;

  // node-llama-cpp runtime objects (loaded lazily)
  private llama: any = null;
  private model: any = null;
  private context: any = null;

  /** Whether the model has been successfully loaded and is ready. */
  private loaded = false;

  /** Whether a load attempt is currently in progress (prevents concurrent loads). */
  private loading = false;

  constructor() {
    this.modelPath = process.env.LLM_MODEL_PATH || './ai-models/qwen3-4b-q4_k_m.gguf';
    this.gpuLayers = parseInt(process.env.LLM_GPU_LAYERS || '0', 10);
    this.contextSize = parseInt(process.env.LLM_CONTEXT_SIZE || '4096', 10);
  }

  /**
   * Ensure the model is loaded. Call this before any inference.
   * Returns true if the model is available, false otherwise.
   * Safe to call multiple times — subsequent calls are no-ops if already loaded.
   */
  async ensureLoaded(): Promise<boolean> {
    if (this.loaded) return true;
    if (this.loading) {
      // Another call is already loading; wait briefly and re-check
      for (let i = 0; i < 60; i++) {
        await this.sleep(1000);
        if (this.loaded) return true;
        if (!this.loading) return false;
      }
      return false;
    }

    this.loading = true;

    try {
      this.logger.log(`[LocalLlm] Loading model from: ${this.modelPath}`);

      // Dynamically import node-llama-cpp (may not be installed)
      const { getLlama } = await import('node-llama-cpp');

      this.llama = await getLlama({ gpu: this.gpuLayers > 0 ? 'cuda' : false });
      this.model = await this.llama.loadModel({ modelPath: this.modelPath });
      this.context = await this.model.createContext({ contextSize: this.contextSize });

      this.loaded = true;
      this.logger.log('[LocalLlm] Model loaded successfully ✓');
      return true;
    } catch (error: any) {
      this.logger.warn(`[LocalLlm] Failed to load model: ${error.message}`);
      this.logger.warn('[LocalLlm] AI features will use fallback responses. To enable local LLM, place a .gguf model file and set LLM_MODEL_PATH in .env');
      this.loaded = false;
      return false;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Check whether the local LLM is available for inference.
   */
  isAvailable(): boolean {
    return this.loaded;
  }

  /**
   * Simple text completion (prompt-in → text-out).
   * Used by AiCustomerService and AiTranslateService.
   *
   * @param prompt  The full prompt string.
   * @param options Optional generation parameters.
   * @returns The generated text, or null if the model is unavailable.
   */
  async completion(prompt: string, options?: CompletionOptions): Promise<string | null> {
    const available = await this.ensureLoaded();
    if (!available) return null;

    try {
      const { LlamaChatSession } = await import('node-llama-cpp');

      const sequence = this.context.getSequence();
      const session = new LlamaChatSession({
        contextSequence: sequence,
      });

      const result = await session.prompt(prompt, {
        maxTokens: options?.maxTokens ?? 512,
        temperature: options?.temperature ?? 0.3,
        topP: options?.topP ?? 0.9,
      });

      return result?.trim() || null;
    } catch (error: any) {
      this.logger.error(`[LocalLlm] Completion failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Chat-style completion with system prompt, message history, and optional tool support.
   * Used by ChatService for the AI Steward.
   *
   * For local models that don't support native function calling, tool definitions
   * are embedded into the system prompt and tool calls are parsed from the model's
   * JSON output.
   *
   * @param messages Conversation history.
   * @param options  Chat options including system prompt and tool definitions.
   * @returns A ChatResult with content and any parsed tool calls.
   */
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResult | null> {
    const available = await this.ensureLoaded();
    if (!available) return null;

    try {
      const { LlamaChatSession } = await import('node-llama-cpp');

      // Build the effective system prompt, embedding tool definitions if present
      let systemPrompt = options?.systemPrompt || 'You are a helpful assistant.';

      if (options?.tools && options.tools.length > 0) {
        systemPrompt = this.injectToolsIntoPrompt(systemPrompt, options.tools);
      }

      const sequence = this.context.getSequence();
      const session = new LlamaChatSession({
        contextSequence: sequence,
        systemPrompt,
      });

      // Feed the conversation history (except the system message which is handled above)
      const conversationMessages = messages.filter((m) => m.role !== 'system');

      // Build the user prompt from conversation messages
      let userPrompt = '';
      for (const msg of conversationMessages) {
        if (msg.role === 'user') {
          userPrompt += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          userPrompt += `Assistant: ${msg.content}\n`;
        } else if (msg.role === 'tool') {
          userPrompt += `Tool Result (${msg.name}): ${msg.content}\n`;
        }
      }

      // If there are prior messages, prompt with the accumulated context
      // Otherwise, use the last user message directly
      const lastUserMsg = conversationMessages.filter((m) => m.role === 'user').pop();
      const promptText = lastUserMsg?.content || userPrompt || 'Hello';

      const result = await session.prompt(promptText, {
        maxTokens: options?.maxTokens ?? 256,
        temperature: options?.temperature ?? 0.7,
        topP: options?.topP ?? 0.9,
      });

      const content = result?.trim() || '';

      // Parse tool calls from the output (if tools were requested)
      const toolCalls = options?.tools?.length
        ? this.parseToolCallsFromOutput(content)
        : [];

      // If tool calls were found, strip them from the visible content
      const displayContent = toolCalls.length > 0
        ? content.replace(/\[TOOL_CALL\][\s\S]*$/m, '').trim()
        : content;

      return {
        content: displayContent,
        toolCalls,
      };
    } catch (error: any) {
      this.logger.error(`[LocalLlm] Chat failed: ${error.message}`);
      return null;
    }
  }

  /**
   * Inject tool definitions into the system prompt so the model can use them
   * even without native function calling support.
   */
  private injectToolsIntoPrompt(systemPrompt: string, tools: ToolDefinition[]): string {
    const toolDescriptions = tools
      .map((t) => {
        const fn = t.function;
        const params = Object.entries(fn.parameters.properties)
          .map(([key, val]) => `    - ${key} (${val.type}): ${val.description}`)
          .join('\n');
        const required = fn.parameters.required?.length
          ? `\n    Required: ${fn.parameters.required.join(', ')}`
          : '';
        return `- ${fn.name}: ${fn.description}\n  Parameters:\n${params}${required}`;
      })
      .join('\n\n');

    return (
      systemPrompt +
      '\n\n## AVAILABLE TOOLS\n\nYou have access to the following tools. When you need to use a tool, respond with a JSON block in this exact format:\n\n' +
      '```json\n[TOOL_CALL]\n{"name": "tool_name", "arguments": {"param1": "value1"}}\n```\n\n' +
      'You can use only ONE tool per response. After the tool call, you will receive the result and can formulate your final answer.\n\n' +
      'If you do NOT need to use a tool, just respond normally with text.\n\n' +
      'Tool definitions:\n\n' +
      toolDescriptions
    );
  }

  /**
   * Parse tool calls from the model's output text.
   * Looks for the `[TOOL_CALL]` marker followed by a JSON object.
   */
  private parseToolCallsFromOutput(output: string): ToolCall[] {
    const toolCalls: ToolCall[] = [];

    // Match [TOOL_CALL] followed by a JSON block
    const pattern = /\[TOOL_CALL\]\s*\n?\s*(\{[\s\S]*?\})/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(output)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        const toolName = parsed.name || '';
        const toolArgs = parsed.arguments || {};

        toolCalls.push({
          id: `call_${Date.now()}_${toolCalls.length}`,
          function: {
            name: toolName,
            arguments: typeof toolArgs === 'string' ? toolArgs : JSON.stringify(toolArgs),
          },
        });
      } catch (e) {
        this.logger.warn(`[LocalLlm] Failed to parse tool call JSON: ${match[1]}`);
      }
    }

    return toolCalls;
  }

  /**
   * Clean up resources when the module is destroyed.
   */
  async onModuleDestroy() {
    try {
      if (this.context) {
        await this.context.dispose();
        this.context = null;
      }
      if (this.model) {
        await this.model.dispose();
        this.model = null;
      }
      if (this.llama) {
        await this.llama.dispose();
        this.llama = null;
      }
      this.loaded = false;
      this.logger.log('[LocalLlm] Resources disposed ✓');
    } catch (error: any) {
      this.logger.warn(`[LocalLlm] Error during cleanup: ${error.message}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
