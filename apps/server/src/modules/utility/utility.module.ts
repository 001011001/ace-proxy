import { Module } from '@nestjs/common';
import { IPFirewallService } from '../sentinel/IPFirewallService';
import { SmartSplitterService } from '../splitter/SmartSplitterService';
import { ResaleHubService } from '../resale/ResaleHubService';

@Module({
  providers: [IPFirewallService, SmartSplitterService, ResaleHubService],
  exports: [IPFirewallService, SmartSplitterService],
})
export class UtilityModule {}
