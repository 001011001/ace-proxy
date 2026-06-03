import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

// Intelligence
import { IntelligenceService } from './modules/intelligence/IntelligenceService';
import { PatentRiskChecker } from './modules/intelligence/PatentRiskChecker';
import { ArbiBotService } from './modules/intelligence/ArbiBotService';
import { ArbiBotController } from './modules/intelligence/ArbiBotController';
import { SentinelScraper } from './modules/intelligence/SentinelScraper';

// Chat
import { ChatService } from './modules/chat/ChatService';
import { ChatController } from './modules/chat/ChatController';

// Holiday
import { HolidayService } from './modules/holiday/HolidayService';
import { HolidayController } from './modules/holiday/HolidayController';
import { HolidayPredictorService } from './modules/holiday/HolidayPredictorService';

// Station
import { StationService } from './modules/station/StationService';
import { StationController } from './modules/station/StationController';

// Vault
import { VaultService } from './modules/vault/VaultService';
import { VaultController } from './modules/vault/VaultController';
import { RiskSentryService } from './modules/vault/RiskSentryService';

// Others
import { IPFirewallService } from './modules/sentinel/IPFirewallService';
import { SmartSplitterService } from './modules/splitter/SmartSplitterService';
import { VisionQCService } from './modules/wms/VisionQCService';
import { ReferralService } from './modules/referral/ReferralService';
import { RegionService } from './modules/region/RegionService';
import { CouponService } from './modules/marketing/CouponService';
import { ResaleHubService } from './modules/resale/ResaleHubService';
import { NotificationService } from './modules/notification/NotificationService';
import { TradeService } from './modules/trade/TradeService';
import { CMSService } from './modules/cms/CMSService';
import { UserLevelService } from './modules/membership/UserLevelService';
import { SupplierScoreService } from './modules/supplier/SupplierScoreService';

// Common
import { RBACMiddleware } from './common/middlewares/RBACMiddleware';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [
    StationController, 
    VaultController, 
    ChatController, 
    ArbiBotController, 
    HolidayController
  ],
  providers: [
    IntelligenceService,
    PatentRiskChecker,
    ArbiBotService,
    ChatService,
    HolidayService,
    SentinelScraper,
    StationService,
    HolidayPredictorService,
    IPFirewallService,
    VaultService,
    RiskSentryService,
    SmartSplitterService,
    VisionQCService,
    ReferralService,
    RegionService,
    CouponService,
    ResaleHubService,
    NotificationService,
    TradeService,
    CMSService,
    UserLevelService,
    SupplierScoreService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RBACMiddleware)
      .forRoutes('*');
  }
}
