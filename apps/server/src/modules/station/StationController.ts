import { Controller, Get } from '@nestjs/common';
import { StationService } from './StationService';

/**
 * StationController - 站点接口
 * 为移动端提供首页货盘、区域设置等展示数据。
 */
@Controller('station')
export class StationController {
  constructor(private readonly stationService: StationService) {}

  /**
   * 获取雅加达站点首页数据
   * 包含节日引擎、利差货盘、站点状态
   */
  @Get('jakarta/home')
  async getJakartaHome() {
    return await this.stationService.getJakartaHome();
  }
}
