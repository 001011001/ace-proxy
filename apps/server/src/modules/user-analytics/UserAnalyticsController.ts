import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserAnalyticsService } from './UserAnalyticsService';

@Controller('user-analytics')
export class UserAnalyticsController {
  constructor(private readonly service: UserAnalyticsService) {}

  @Get('segments')
  async getSegments() {
    return this.service.getSegments();
  }

  @Get('churn-risk')
  async getChurnRiskUsers(
    @Query('risk') risk?: 'MEDIUM' | 'HIGH',
    @Query('limit') limit?: string,
  ) {
    const users = await this.service.getChurnRiskUsers(
      risk || 'MEDIUM',
      limit ? parseInt(limit, 10) : 50,
    );
    return { users };
  }

  @Get('profile/:userId')
  async getUserProfile(@Param('userId') userId: string) {
    return this.service.getUserProfile(userId);
  }

  @Get('recommendations/:userId')
  async getRecommendations(@Param('userId') userId: string) {
    return this.service.getPersonalizedRecommendations(userId);
  }
}
