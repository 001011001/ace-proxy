import { IsArray, IsBoolean, IsString, IsOptional, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyzeBatchDto {
  @IsArray()
  @IsString({ each: true })
  urls: string[];
}

export class ScanAndListDto {
  @IsString()
  url: string;

  @IsString()
  targetCountry: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minMarginPct?: number;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}

export class ScanTrendingDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  /**
   * 是否自动上架达标商品（批量扫描+上架一体化）
   * 为 true 时，利差达到 minMarginPct 的商品将自动创建并发布到 CMS 爆款区。
   */
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  autoList?: boolean;

  /** 自动上架的最低利差百分比（默认 30） */
  @IsOptional()
  @IsNumber()
  @Min(0)
  minMarginPct?: number;
}

export class PromoteToHeroDto {
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
}
