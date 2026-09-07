import { Module } from '@nestjs/common';
import { AiTranslateService } from './AiTranslateService';
import { AiTranslateController } from './AiTranslateController';
import { LlmModule } from '../llm/LlmModule';

@Module({
  imports: [LlmModule],
  controllers: [AiTranslateController],
  providers: [AiTranslateService],
  exports: [AiTranslateService],
})
export class AiTranslateModule {}
