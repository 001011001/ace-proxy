import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class SendLogisticUpdateDto {
  @IsString()
  userId: string;

  @IsString()
  status: string;

  @IsString()
  trackingId: string;
}

export class SendMarketingBlastDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsString()
  content: string;
}

export class SendWhatsAppDto {
  @IsString()
  phone: string;

  @IsString()
  text: string;
}

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
