import { IsString } from 'class-validator';

export class AnalyzeLinkDto {
  @IsString()
  url: string;
}
