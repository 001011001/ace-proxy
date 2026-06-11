import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

// Infrastructure
import { PrismaModule } from './prisma/prisma.module';

// Auth
import { AuthModule } from './modules/auth/auth.module';

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

// Payment
import { PaymentModule } from './modules/payment/PaymentModule';

// Shipping
import { ShippingModule } from './modules/shipping/ShippingModule';

// Cron
import { CronService } from './modules/cron/CronService';

// Inventory
import { InventoryService } from './modules/inventory/InventoryService';

// AI modules
import { AiTranslateService } from './modules/ai-translate/AiTranslateService';
import { AiPushService } from './modules/push/AiPushService';

// Security
import { ThrottlerGuard } from './common/guards/ThrottlerGuard';
import { WebhookVerifier } from './common/WebhookVerifier';

// Phase 1: AI Customer + Logistics + Profit + AutoListing
import { AiCustomerService } from './modules/customer-service/AiCustomerService';
import { CustomerServiceController } from './modules/customer-service/CustomerServiceController';
import { LogisticsTrackingService } from './modules/logistics-tracking/LogisticsTrackingService';
import { LogisticsTrackingController } from './modules/logistics-tracking/LogisticsTrackingController';
import { ProfitDashboardService } from './modules/profit-dashboard/ProfitDashboardService';
import { ProfitDashboardController } from './modules/profit-dashboard/ProfitDashboardController';
import { AutoListingService } from './modules/auto-listing/AutoListingService';
import { AutoListingController } from './modules/auto-listing/AutoListingController';

// Phase 1.5: Cart Consolidation + Trending + Analytics + Pricing
import { CartConsolidationService } from './modules/cart/CartConsolidationService';
import { TrendingEngine } from './modules/trending-engine/TrendingEngine';
import { UserAnalyticsService } from './modules/user-analytics/UserAnalyticsService';
import { PricingAssistant } from './modules/pricing-assistant/PricingAssistant';
import { Alibaba1688Service } from './modules/intelligence/Alibaba1688Service';

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
import { TradeController } from './modules/trade/TradeController';
import { CMSService } from './modules/cms/CMSService';
import { UserLevelService } from './modules/membership/UserLevelService';
import { SupplierScoreService } from './modules/supplier/SupplierScoreService';
import { HealthController } from './modules/health/HealthController';
import { RBACMiddleware } from './common/middlewares/RBACMiddleware';
import { ProductService } from './modules/product/ProductService';
import { ProductController } from './modules/product/ProductController';
import { CartService } from './modules/cart/CartService';
import { CartController } from './modules/cart/CartController';

// Dashboard
import { DashboardService } from './modules/dashboard/DashboardService';
import { DashboardController } from './modules/dashboard/DashboardController';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    PaymentModule,
    ShippingModule,
  ],
  controllers: [
    StationController,
    VaultController,
    ChatController,
    ArbiBotController,
    HolidayController,
    TradeController,
    HealthController,
    ProductController,
    CartController,
    DashboardController,
    CustomerServiceController,
    LogisticsTrackingController,
    ProfitDashboardController,
    AutoListingController,
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
    ProductService,
    CartService,
    DashboardService,
    CronService,
    InventoryService,
    AiTranslateService,
    AiPushService,
    ThrottlerGuard,
    WebhookVerifier,
    AiCustomerService,
    LogisticsTrackingService,
    ProfitDashboardService,
    AutoListingService,
    CartConsolidationService,
    TrendingEngine,
    UserAnalyticsService,
    PricingAssistant,
    Alibaba1688Service,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RBACMiddleware).forRoutes('vault', 'station', 'holiday');
  }
}
