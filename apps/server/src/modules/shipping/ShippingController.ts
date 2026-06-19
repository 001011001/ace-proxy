import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ShippingService } from './ShippingService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';

@Controller('shipping')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class ShippingController {
  constructor(private readonly shipping: ShippingService) {}

  /**
   * 运费估算（轻量级，列表页使用）
   */
  @Get('estimate')
  getEstimate(
    @Query('country') country: string,
    @Query('zone') zone?: string,
    @Query('weightKg') weightKg?: string,
    @Query('hasBattery') hasBattery?: string,
    @Query('itemCount') itemCount?: string,
  ) {
    if (!country) {
      return this.shipping.getEstimateRange('ID');
    }

    if (!weightKg) {
      return this.shipping.getEstimateRange(country, zone);
    }

    return this.shipping.getUserQuote({
      country,
      zone,
      weightKg: parseFloat(weightKg),
      hasBattery: hasBattery === 'true',
      itemCount: parseInt(itemCount || '1'),
    });
  }

  /**
   * 精确运费报价（结算页使用）
   */
  @Post('quote')
  getQuote(@Body() body: {
    country: string;
    zone?: string;
    parcels: { weightKg: number; hasBattery: boolean }[];
    currency?: string;
  }) {
    if (body.parcels.length > 1) {
      return this.shipping.getConsolidatedUserQuote({
        country: body.country,
        zone: body.zone,
        parcels: body.parcels,
        currency: body.currency,
      });
    }

    return this.shipping.getUserQuote({
      country: body.country,
      zone: body.zone,
      weightKg: body.parcels[0]?.weightKg || 0,
      hasBattery: body.parcels[0]?.hasBattery || false,
      itemCount: body.parcels.length,
      currency: body.currency,
    });
  }

  /**
   * 地址验证
   */
  @Get('validate-address')
  validateAddress(
    @Query('country') country: string,
    @Query('city') city: string,
    @Query('province') province?: string,
  ) {
    return this.shipping.validateAddress(country, city, province);
  }
}
