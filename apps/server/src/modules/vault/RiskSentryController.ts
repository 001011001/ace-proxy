import { Controller, Get } from '@nestjs/common';
import { RiskSentryService } from './RiskSentryService';

@Controller('risk-sentry')
export class RiskSentryController {
  constructor(private readonly service: RiskSentryService) {}

  @Get('alerts')
  async getAlerts() {
    return this.service.getAlerts();
  }

  @Get('health')
  async getHealthMetrics() {
    return this.service.getHealthMetrics();
  }
}
