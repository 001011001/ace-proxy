import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ArbiBotService } from './ArbiBotService';

@Controller('arbibot')
export class ArbiBotController {
  private readonly logger = new Logger(ArbiBotController.name);

  constructor(private readonly arbiBotService: ArbiBotService) {}

  @Post('analyze')
  async analyze(@Body() body: { url: string }) {
    this.logger.log(`[ArbiBot] Received analysis request for: ${body.url}`);
    return this.arbiBotService.analyzeLink(body.url);
  }
}
