import { Module } from '@nestjs/common';
import { IntelligenceService } from '../intelligence/IntelligenceService';
import { PatentRiskChecker } from '../intelligence/PatentRiskChecker';
import { ArbiBotService } from '../intelligence/ArbiBotService';
import { ArbiBotController } from '../intelligence/ArbiBotController';
import { SentinelScraper } from '../intelligence/SentinelScraper';
import { Alibaba1688Service } from '../intelligence/Alibaba1688Service';
import { JdService } from '../intelligence/JdService';
import { TaobaoService } from '../intelligence/TaobaoService';
import { UnifiedSourcingService } from '../intelligence/UnifiedSourcingService';
import { ScraplingFetcher } from '../intelligence/ScraplingFetcher';
import { TrendingEngine } from '../trending-engine/TrendingEngine';
import { TrendingEngineController } from '../trending-engine/TrendingEngineController';
import { CMSService } from '../cms/CMSService';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [PrismaModule, ProductModule],
  controllers: [ArbiBotController, TrendingEngineController],
  providers: [
    IntelligenceService, PatentRiskChecker, ArbiBotService, SentinelScraper,
    Alibaba1688Service, JdService, TaobaoService, UnifiedSourcingService,
    ScraplingFetcher, TrendingEngine, CMSService,
  ],
  exports: [IntelligenceService, SentinelScraper, ScraplingFetcher, CMSService],
})
export class IntelligenceModule {}
