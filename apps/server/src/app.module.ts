import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { IntelligenceService } from './modules/intelligence/IntelligenceService';
import { PatentRiskChecker } from './modules/intelligence/PatentRiskChecker';
import { ChatService } from './modules/chat/ChatService';
import { ChatController } from './modules/chat/ChatController';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [StationController, VaultController, ChatController],
  providers: [
    IntelligenceService,
    PatentRiskChecker,
    ChatService,
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
