import { IsString, IsOptional } from 'class-validator';

export class EvaluateRiskDto {
  @IsString()
  imageUrl: string;
}

export class BatchEvaluateRiskDto {
  @IsString({ each: true })
  imageUrls: string[];
}
