import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({ example: 'uuid-product-1', description: '商品ID' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, description: '数量' })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto], description: '订单商品列表' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 'JKT', description: '目的地' })
  @IsString()
  destination: string;

  @ApiPropertyOptional({ example: 'uuid-partner', description: '团长ID' })
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiProperty({ example: true, description: '已同意服务条款' })
  @IsBoolean()
  termsAccepted: boolean;
}

export class CalculateFeesDto {
  @ApiProperty({ example: 1000000, description: '商品金额（印尼盾）' })
  @IsNumber()
  @Min(0)
  baseAmount: number;

  @ApiPropertyOptional({ example: 'JKT', description: '目的地' })
  @IsOptional()
  @IsString()
  destination?: string;
}

export class OrderListQueryDto {
  @ApiPropertyOptional({ example: 'PENDING' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number = 20;
}
