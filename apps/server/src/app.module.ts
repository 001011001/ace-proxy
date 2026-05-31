import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { IntelligenceService } from './modules/intelligence/IntelligenceService';
import { SentinelScraper } from './modules/intelligence/SentinelScraper';
import { StationController } from './modules/station/StationController';
import { StationService } from './modules/station/StationService';
import { HolidayPredictorService } from './modules/holiday/HolidayPredictorService';
import { IPFirewallService } from './modules/sentinel/IPFirewallService';
import { VaultService } from './modules/vault/VaultService';
import { VaultController } from './modules/vault/VaultController';
import { RiskSentryService } from './modules/vault/RiskSentryService';
import { SmartSplitterService } from './modules/splitter/SmartSplitterService';
import { VisionQCService } from './modules/wms/VisionQCService';
import { ReferralService } from './modules/referral/ReferralService';
import { RegionService } from './modules/region/RegionService';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [StationController, VaultController],
  providers: [
    IntelligenceService,
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
  ],
})
export class AppModule {}
