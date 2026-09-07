import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CheckComplianceDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  destinationCountry: string;
}

export class CategoryRequirementsDto {
  @IsString()
  category: string;

  @IsString()
  country: string;
}

export class QuickCheckDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  country: string;
}
