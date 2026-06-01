import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { IntelligenceService } from './modules/intelligence/IntelligenceService';
import { PatentRiskChecker } from './modules/intelligence/PatentRiskChecker';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [StationController, VaultController],
  providers: [
    IntelligenceService,
    PatentRiskChecker,
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
