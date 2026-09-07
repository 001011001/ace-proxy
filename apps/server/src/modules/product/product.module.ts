import { Module } from '@nestjs/common';
import { ProductController } from './ProductController';
import { ProductService } from './ProductService';
import { ComplianceService } from '../compliance/ComplianceService';
import { AiTranslateService } from '../ai-translate/AiTranslateService';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductService, ComplianceService, AiTranslateService],
  exports: [ProductService],
})
export class ProductModule {}
