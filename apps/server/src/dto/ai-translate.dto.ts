import { IsString, IsArray, IsOptional } from 'class-validator';

export class TranslateDto {
  @IsString()
  text: string;

  @IsString()
  targetCountry: string;
}

export class TranslateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  specs: string[];

  @IsString()
  targetCountry: string;
}

export class TranslateBatchDto {
  @IsArray()
  items: Array<{
    title: string;
    description: string;
    specs: string[];
    targetCountry: string;
  }>;
}
