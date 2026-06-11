import { IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TierConfigDto {
  @IsNumber()
  serviceFeePct: number;

  @IsNumber()
  rebatePct: number;
}

export class RecordLedgerDto {
  @IsNumber()
  total: number;

  @IsNumber()
  cost: number;

  @IsNumber()
  shipping: number;

  @IsNumber()
  partnerCommission: number;

  @ValidateNested()
  @Type(() => TierConfigDto)
  tierConfig: TierConfigDto;
}
