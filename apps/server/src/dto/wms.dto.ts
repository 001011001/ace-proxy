import { IsString, IsOptional, IsObject, IsNumber } from 'class-validator';

export class PerformQCDto {
  @IsString()
  imageUrl: string;

  @IsObject()
  expectedProduct: {
    id: string;
    name: string;
    category?: string;
    specs?: Record<string, any>;
  };

  @IsOptional()
  @IsString()
  category?: string;
}

export class CalculateCompressionDto {
  @IsNumber()
  weight: number;

  @IsNumber()
  originalVolume: number;

  @IsNumber()
  compressedVolume: number;
}

export class BatchQCDto {
  @IsString()
  orderId: string;
}
