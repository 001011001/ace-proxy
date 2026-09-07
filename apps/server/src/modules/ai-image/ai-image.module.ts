import { Module, Global } from '@nestjs/common';
import { ImagePipelineService } from './ImagePipelineService';

@Global()
@Module({
  providers: [ImagePipelineService],
  exports: [ImagePipelineService],
})
export class AiImageModule {}
