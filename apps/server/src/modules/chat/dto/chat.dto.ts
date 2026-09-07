import { IsArray, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatHistoryItem {
  @ApiProperty({ example: 'user', enum: ['user', 'assistant', 'tool'] })
  @IsString()
  role: string;

  @ApiProperty({ example: '帮我找一件巴厘岛风格的连衣裙' })
  @IsString()
  content: string;
}

export class StewardChatDto {
  @ApiProperty({ example: '有什么推荐的穆斯林服装？', description: '用户消息' })
  @IsString()
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({ type: [ChatHistoryItem], description: '对话历史' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItem)
  history?: ChatHistoryItem[];
}
