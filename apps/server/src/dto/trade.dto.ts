import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;
}

class OrderAmountsDto {
  @IsNumber()
  total: number;

  @IsNumber()
  cost: number;

  @IsNumber()
  shipping: number;

  @IsNumber()
  serviceFee: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => OrderAmountsDto)
  amounts: OrderAmountsDto;

  @IsOptional()
  @IsString()
  partner_id?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsBoolean()
  terms_accepted: boolean;
}

export class CalculateFeesDto {
  @IsNumber()
  baseAmount: number;
}

export class SalvageActionDto {
  @IsEnum(['ACCEPT_WITH_REBATE', 'RESALE', 'RETURN'])
  action: 'ACCEPT_WITH_REBATE' | 'RESALE' | 'RETURN';
}
