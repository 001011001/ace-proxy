import { Module } from '@nestjs/common';
import { AiCustomerService } from './AiCustomerService';
import { CustomerServiceController } from './CustomerServiceController';
import { KnowledgeBase } from './KnowledgeBase';
import { ConversationMemory } from './ConversationMemory';
import { CustomerServiceTools } from './CustomerServiceTools';
import { PrismaModule } from '../../prisma/prisma.module';
import { LlmModule } from '../llm/LlmModule';
import { ShippingModule } from '../shipping/ShippingModule';

@Module({
  imports: [PrismaModule, LlmModule, ShippingModule],
  controllers: [CustomerServiceController],
  providers: [
    AiCustomerService,
    KnowledgeBase,
    ConversationMemory,
    CustomerServiceTools,
  ],
  exports: [AiCustomerService],
})
export class CustomerServiceModule {}
