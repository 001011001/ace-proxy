import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SettlementQueryDto {
  @ApiPropertyOptional({ example: 'uuid-partner-1', description: '团长ID' })
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiPropertyOptional({ example: '2026-01', description: '结算月份' })
  @IsOptional()
  @IsString()
  month?: string;
}

export class ChargebackDto {
  @ApiProperty({ example: 'uuid-order-1', description: '订单ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 50000, description: '拒付金额' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'Customer dispute', description: '拒付原因' })
  @IsString()
  @MaxLength(500)
  reason: string;
}

export class ProfitPulseQueryDto {
  @ApiPropertyOptional({ example: 'JKT', description: '站点' })
  @IsOptional()
  @IsString()
  station?: string;
}
