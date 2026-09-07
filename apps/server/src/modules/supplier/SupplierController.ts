import { Controller, Post, Get, Body, Param, Logger, UseGuards } from '@nestjs/common';
import { SupplierScoreService } from './SupplierScoreService';
import { EvaluateSupplierDto, RecordPerformanceDto } from '../../dto/supplier.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ThrottlerGuard } from '../../common/guards/ThrottlerGuard';

@Controller('supplier')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class SupplierController {
  private readonly logger = new Logger(SupplierController.name);

  constructor(private readonly supplierScore: SupplierScoreService) {}

  /**
   * 供应商风险评估
   */
  @Post('evaluate')
  async evaluate(@Body() dto: EvaluateSupplierDto) {
    this.logger.log(`[Supplier] Evaluating ${dto.supplierId}`);
    return this.supplierScore.evaluateSupplier(dto);
  }

  /**
   * 供应商列表 — 管理后台供应商管理页
   */
  @Get('list')
  async listSuppliers() {
    return this.supplierScore.listSuppliers();
  }

  /**
   * 记录供应商表现数据
   */
  @Post(':supplierId/performance')
  async recordPerformance(
    @Param('supplierId') supplierId: string,
    @Body() dto: RecordPerformanceDto,
  ) {
    return this.supplierScore.recordPerformance(supplierId, dto.metric, dto.value);
  }

  /**
   * 获取红线规则 — 管理后台展示供应商审核标准
   */
  @Get('red-line-rules')
  getRedLineRules() {
    return {
      maxLeadTimeHours: 72,
      maxDefectRate: 0.03,
      maxRejectionRate: 0.08,
      rules: [
        { name: 'Lead Time', threshold: '72h', description: '平均到货时间超过72小时触发黑名单' },
        { name: 'Defect Rate', threshold: '3%', description: '缺陷率超过3%触发黑名单' },
        { name: 'Rejection Rate', threshold: '8%', description: '退货率超过8%触发黑名单' },
      ],
    };
  }
}
