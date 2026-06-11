import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateHolidayConfigDto {
  @IsOptional()
  @IsString()
  stationId?: string;

  @IsOptional()
  @IsString()
  festivalName?: string;

  @IsOptional()
  @IsString()
  themeId?: string;

  @IsOptional()
  @IsNumber()
  reminderDays?: number;

  @IsOptional()
  @IsString()
  reminderMessage?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ToggleHolidayDto {
  @IsBoolean()
  isActive: boolean;
}
