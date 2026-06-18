import { Controller, Post, Body, Logger, UseGuards } from '@nestjs/common';
import { ArbiBotService } from './ArbiBotService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';
import { AnalyzeLinkDto } from '../../dto/arbibot.dto';

@Controller('arbibot')
export class ArbiBotController {
  private readonly logger = new Logger(ArbiBotController.name);

  constructor(private readonly arbiBotService: ArbiBotService) {}

  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @Post('analyze')
  async analyze(@Body() body: AnalyzeLinkDto) {
    this.logger.log(`[ArbiBot] Received analysis request for: ${body.url}`);
    return this.arbiBotService.analyzeLink(body.url);
  }
}
