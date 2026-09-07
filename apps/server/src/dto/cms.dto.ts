import { IsString, IsNumber, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

class HeroProductInput {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  sourcePriceCNY: number;

  @IsNumber()
  @Min(0)
  targetPriceIDR: number;

  @IsNumber()
  @Min(0)
  marginPct: number;

  @IsString()
  imageUrl: string;
}

export class BulkPublishDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeroProductInput)
  products: HeroProductInput[];
}

export class PromoteToHeroFromTrendingDto {
  @IsString()
  productName: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  sourcePriceCNY: number;

  @IsNumber()
  @Min(0)
  targetPriceIDR: number;

  @IsNumber()
  @Min(0)
  marginPct: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
