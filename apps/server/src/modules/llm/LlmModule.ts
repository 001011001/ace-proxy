import { Global, Module } from '@nestjs/common';
import { LocalLlmService } from './LocalLlmService';

/**
 * LlmModule — Global module providing LocalLlmService.
 *
 * Marked @Global() so that LocalLlmService is available across the entire
 * application without needing to import LlmModule in every feature module.
 */
@Global()
@Module({
  providers: [LocalLlmService],
  exports: [LocalLlmService],
})
export class LlmModule {}
