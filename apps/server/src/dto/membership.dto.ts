import { IsString, IsNumber, Min } from 'class-validator';

export class CalculateLevelDto {
  @IsNumber()
  @Min(0)
  totalSpend: number;
}

export class GetFeeDiscountDto {
  @IsString()
  userId: string;

  @IsNumber()
  @Min(0)
  totalSpend: number;
}
