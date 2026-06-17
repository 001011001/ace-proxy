import { Controller, Get, Query } from '@nestjs/common';
import { TrendingEngine } from './TrendingEngine';

@Controller('trending')
export class TrendingEngineController {
  constructor(private readonly trending: TrendingEngine) {}

  @Get('scan')
  async scanHot(@Query('country') country = 'ID', @Query('limit') limit = '20') {
    return this.trending.scanHotProducts(country, parseInt(limit));
  }

  @Get('recommendations')
  async recommendations(@Query('country') country = 'ID') {
    return this.trending.getListingRecommendations(country);
  }

  @Get('categories')
  async categoryTrends(@Query('country') country = 'ID') {
    return this.trending.getCategoryTrends(country);
  }
}
