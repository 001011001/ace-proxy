import { IsString, IsNumber, IsOptional, IsEnum, Min, Max, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export class CreateProductDto {
  @ApiProperty({ example: 'Premium Silk Hijab', description: '商品名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Fashion', description: '分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 1250000, description: '印尼盾售价' })
  @IsNumber()
  @Min(0)
  priceIdr: number;

  @ApiPropertyOptional({ example: 85000, description: '人民币成本' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costCny?: number;

  @ApiPropertyOptional({ example: 'https://detail.1688.com/...', description: '货源链接' })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiPropertyOptional({ example: '高品质丝质头巾...', description: '商品描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 100, description: '库存' })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Premium Silk Hijab V2' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceIdr?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  costCny?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}

export class ProductListQueryDto {
  @ApiPropertyOptional({ example: 'Fashion' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ example: 'ID', description: '国家代码' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ enum: ['price', 'rating', 'newest', 'popular'] })
  @IsOptional()
  @IsString()
  sortBy?: string;
}
