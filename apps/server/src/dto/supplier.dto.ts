import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class EvaluateSupplierDto {
  @IsString()
  supplierId: string;

  @IsNumber()
  @Min(0)
  avgLeadTimeHrs: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  defectRate: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  resaleRejectionRate: number;

  @IsNumber()
  @Min(0)
  totalOrders: number;
}

export class RecordPerformanceDto {
  @IsString()
  supplierId: string;

  @IsString()
  metric: 'leadTime' | 'defect' | 'rejection';

  @IsNumber()
  value: number;
}
