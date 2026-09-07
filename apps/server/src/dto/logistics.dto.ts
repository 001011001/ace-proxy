import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class AdvanceNodeDto {
  @IsString()
  orderId: string;

  @IsString()
  targetNode: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  operatorId?: string;
}

export class BulkAdvanceDto {
  @IsArray()
  @IsString({ each: true })
  orderIds: string[];

  @IsString()
  targetNode: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class HandleQCResultDto {
  @IsString()
  orderId: string;

  @IsBoolean()
  passed: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}

export class GetTimelineDto {
  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  lang?: string;
}
