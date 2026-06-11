import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { TradeService } from './TradeService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto, CalculateFeesDto, SalvageActionDto } from '../../dto/trade.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('trade')
export class TradeController {
  constructor(
    private readonly tradeService: TradeService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('onboarding/confirm')
  async confirmOnboarding(@Req() req: any) {
    return this.tradeService.recordOnboardingConfirmation(req.user.userId, {
      ip: req.ip,
      deviceId: req.headers['x-device-id'] || 'unknown',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('order')
  async createOrder(
    @Req() req: any,
    @Body() body: CreateOrderDto,
  ) {
    return this.tradeService.createOrder(
      { ...body, userId: req.user.userId },
      {
        ip: req.ip,
        deviceId: req.headers['x-device-id'] || 'unknown',
        terms_accepted: body.terms_accepted,
      },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('calculate-fees')
  async calculateFees(@Req() req: any, @Body() body: CalculateFeesDto) {
    const user = await this.prisma.aceUser.findUnique({
      where: { id: req.user.userId },
      select: { totalSpend: true },
    });
    const totalSpend = Number(user?.totalSpend) || 0;
    return this.tradeService.calculateFinalFees(
      req.user.userId,
      body.baseAmount,
      totalSpend,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('salvage/:orderId')
  async salvageAction(
    @Req() req: any,
    @Param('orderId') orderId: string,
    @Body() body: SalvageActionDto,
  ) {
    return this.tradeService.handleSalvageAction(req.user.userId, orderId, body.action);
  }
}
