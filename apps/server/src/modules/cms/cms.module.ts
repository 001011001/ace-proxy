import { Module } from '@nestjs/common';
import { CMSService } from '../cms/CMSService';
import { CMSController } from '../cms/CMSController';
import { AutoListingService } from '../auto-listing/AutoListingService';
import { AutoListingController } from '../auto-listing/AutoListingController';
import { PricingAssistant } from '../pricing-assistant/PricingAssistant';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CMSController, AutoListingController],
  providers: [CMSService, AutoListingService, PricingAssistant],
  exports: [CMSService],
})
export class CMSModule {}
