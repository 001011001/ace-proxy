import { Global, Module } from '@nestjs/common';
import { LocalLlmService } from './LocalLlmService';
import { CloudLlmService } from './CloudLlmService';

/**
 * LlmModule — Global module提供 LocalLlmService 与 CloudLlmService。
 *
 * Marked @Global() so that both services are available across the entire
 * application without needing to import LlmModule in every feature module.
 *
 * 调度优先级（由各调用方实现）：云端 CloudLlmService → Ollama → 本地 LocalLlmService → 兜底
 */
@Global()
@Module({
  providers: [LocalLlmService, CloudLlmService],
  exports: [LocalLlmService, CloudLlmService],
})
export class LlmModule {}
