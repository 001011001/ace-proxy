import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

class ChatMessageDto {
  @IsString()
  role: string;

  @IsString()
  content: string;
}

export class StewardChatDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  history?: ChatMessageDto[];
}
