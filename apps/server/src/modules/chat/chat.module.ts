import { Module } from '@nestjs/common';
import { ChatService } from '../chat/ChatService';
import { ChatController } from '../chat/ChatController';
import { ChatLogService } from '../chat/ChatLogService';
import { AiCustomerService } from '../customer-service/AiCustomerService';
import { CustomerServiceController } from '../customer-service/CustomerServiceController';
import { AiTranslateService } from '../ai-translate/AiTranslateService';
import { PrismaModule } from '../../prisma/prisma.module';
import { LlmModule } from '../llm/LlmModule';

@Module({
  imports: [PrismaModule, LlmModule],
  controllers: [ChatController, CustomerServiceController],
  providers: [ChatService, ChatLogService, AiCustomerService, AiTranslateService],
  exports: [ChatService, AiTranslateService],
})
export class ChatModule {}
