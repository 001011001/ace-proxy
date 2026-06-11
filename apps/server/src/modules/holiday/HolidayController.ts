import { Controller, Get, Post, Body, Query, Logger, UseGuards } from '@nestjs/common';
import { HolidayService, HolidayConfig } from './HolidayService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateHolidayConfigDto, ToggleHolidayDto } from '../../dto/holiday.dto';

@Controller('holiday')
export class HolidayController {
  private readonly logger = new Logger(HolidayController.name);

  constructor(private readonly holidayService: HolidayService) {}

  /**
   * App 端调用：获取节日 UI 设置
   */
  @Get('active-config')
  async getActiveConfig(@Query('stationId') stationId: string) {
    return this.holidayService.getConfig(stationId || 'ID');
  }

  /**
   * 管理后台调用：老板选择 UI 方案并更新
   */
  @UseGuards(JwtAuthGuard)
  @Post('update-config')
  async updateConfig(@Body() config: UpdateHolidayConfigDto) {
    this.logger.log(`[Admin] Request to update holiday config: ${JSON.stringify(config)}`);
    return this.holidayService.updateConfig(config);
  }

  /**
   * 管理后台调用：老板点击“一键点火”
   */
  @UseGuards(JwtAuthGuard)
  @Post('toggle')
  async toggle(@Body() body: ToggleHolidayDto) {
    return this.holidayService.toggleActivation(body.isActive);
  }
}
