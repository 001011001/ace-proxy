import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

// Infrastructure
import { PrismaModule } from './prisma/prisma.module';

// LLM (node-llama-cpp in-process inference)
import { LlmModule } from './modules/llm/LlmModule';

// Auth
import { AuthModule } from './modules/auth/auth.module';
import { SupabaseModule } from './modules/supabase/supabase.module';

// Intelligence
import { IntelligenceService } from './modules/intelligence/IntelligenceService';
import { PatentRiskChecker } from './modules/intelligence/PatentRiskChecker';
import { ArbiBotService } from './modules/intelligence/ArbiBotService';
import { ArbiBotController } from './modules/intelligence/ArbiBotController';
import { SentinelScraper } from './modules/intelligence/SentinelScraper';
import { ScraplingFetcher } from './modules/intelligence/ScraplingFetcher';
import { StationAdminService } from './modules/station/StationAdminService';

// Chat
import { ChatService } from './modules/chat/ChatService';
import { ChatController } from './modules/chat/ChatController';
import { ChatLogService } from './modules/chat/ChatLogService';

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
import { RiskSentryController } from './modules/vault/RiskSentryController';

// Payment
import { PaymentModule } from './modules/payment/PaymentModule';

// Compliance
import { ComplianceModule } from './modules/compliance/compliance.module';

// Purchase Order (ERP)
import { PurchaseOrderModule } from './modules/purchase-order/purchase-order.module';

// Notification
import { NotificationModule } from './modules/notification/notification.module';

// Finance
import { FinanceModule } from './modules/finance/finance.module';

// Batch Operations
import { BatchModule } from './modules/batch/batch.module';

// Shipping
import { ShippingModule } from './modules/shipping/ShippingModule';

// Cron
import { CronService } from './modules/cron/CronService';

// Inventory
import { InventoryService } from './modules/inventory/InventoryService';

// AI modules
import { AiTranslateService } from './modules/ai-translate/AiTranslateService';
import { AiPushService } from './modules/push/AiPushService';
import { AiPushController } from './modules/push/AiPushController';
import { AiImageModule } from './modules/ai-image/ai-image.module';

// Security
import { ThrottlerGuard } from './common/guards/ThrottlerGuard';
import { WebhookVerifier } from './common/WebhookVerifier';

// Phase 1: AI Customer + Logistics + Profit + AutoListing
import { AiCustomerService } from './modules/customer-service/AiCustomerService';
import { CustomerServiceController } from './modules/customer-service/CustomerServiceController';
import { KnowledgeBase } from './modules/customer-service/KnowledgeBase';
import { ConversationMemory } from './modules/customer-service/ConversationMemory';
import { CustomerServiceTools } from './modules/customer-service/CustomerServiceTools';
import { LogisticsTrackingService } from './modules/logistics-tracking/LogisticsTrackingService';
import { LogisticsTrackingController } from './modules/logistics-tracking/LogisticsTrackingController';
import { ProfitDashboardService } from './modules/profit-dashboard/ProfitDashboardService';
import { ProfitDashboardController } from './modules/profit-dashboard/ProfitDashboardController';
import { AutoListingService } from './modules/auto-listing/AutoListingService';
import { AutoListingController } from './modules/auto-listing/AutoListingController';
import { SmartCollectService } from './modules/smart-collect/SmartCollectService';
import { SmartCollectController } from './modules/smart-collect/SmartCollectController';

// Phase 1.5: Cart Consolidation + Trending + Analytics + Pricing
import { CartConsolidationService } from './modules/cart/CartConsolidationService';
import { TrendingEngine } from './modules/trending-engine/TrendingEngine';
import { TrendingEngineController } from './modules/trending-engine/TrendingEngineController';
import { UserAnalyticsService } from './modules/user-analytics/UserAnalyticsService';
import { UserAnalyticsController } from './modules/user-analytics/UserAnalyticsController';
import { PricingAssistant } from './modules/pricing-assistant/PricingAssistant';
import { Alibaba1688Service } from './modules/intelligence/Alibaba1688Service';
import { JdService } from './modules/intelligence/JdService';
import { TaobaoService } from './modules/intelligence/TaobaoService';
import { UnifiedSourcingService } from './modules/intelligence/UnifiedSourcingService';

// Others
import { IPFirewallService } from './modules/sentinel/IPFirewallService';
import { SmartSplitterService } from './modules/splitter/SmartSplitterService';
import { WmsModule } from './modules/wms/wms.module';
// ERP 控制器：与 OrderController 一致，直接注册进 controllers 数组
// 注：SupplierModule/InventoryModule 以模块方式 imports 时路由未被映射（原因待查），
// 故改为直接注册 Controller。其依赖的 SupplierScoreService / InventoryService
// 已在下方 providers 中提供，无需再导入模块。
import { SupplierController } from './modules/supplier/SupplierController';
import { InventoryController } from './modules/inventory/InventoryController';
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

// Order
import { OrderController } from './modules/order/OrderController';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    LlmModule,
    AuthModule,
    SupabaseModule,
    PaymentModule,
    ComplianceModule,
    PurchaseOrderModule,
    WmsModule,
    NotificationModule,
    FinanceModule,
    BatchModule,
    ShippingModule,
    AiImageModule,
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
    SmartCollectController,
    TrendingEngineController,
    UserAnalyticsController,
    AiPushController,
    RiskSentryController,
    OrderController,
    SupplierController,
    InventoryController,
  ],
  providers: [
    // Global guard: rate-limiting for all controllers
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    IntelligenceService,
    PatentRiskChecker,
    ArbiBotService,
    ChatService,
    ChatLogService,
    HolidayService,
    SentinelScraper,
    // SentinelScraper 的依赖，此前缺失导致最新代码无法启动（只能回退旧 dist）
    ScraplingFetcher,
    StationService,
    // StationService 的依赖，同样缺失导致新代码启动失败
    StationAdminService,
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
    WebhookVerifier,
    AiCustomerService,
    KnowledgeBase,
    ConversationMemory,
    CustomerServiceTools,
    LogisticsTrackingService,
    ProfitDashboardService,
    AutoListingService,
    SmartCollectService,
    CartConsolidationService,
    TrendingEngine,
    UserAnalyticsService,
    PricingAssistant,
    Alibaba1688Service,
    JdService,
    TaobaoService,
    UnifiedSourcingService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RBACMiddleware).forRoutes('vault', 'station', 'holiday');
  }
}
