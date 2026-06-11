import { Controller, Post, Body } from '@nestjs/common';
import { AutoListingService } from './AutoListingService';

@Controller('api/auto-listing')
export class AutoListingController {
  constructor(private readonly listing: AutoListingService) {}

  @Post('parse-url')
  parseUrl(@Body() body: { url: string }) {
    return this.listing.parseUrl(body.url);
  }

  @Post('list-from-url')
  async listFromUrl(@Body() body: { url: string; targetCountry: string }) {
    return this.listing.listFromUrl(body.url, body.targetCountry);
  }
}
