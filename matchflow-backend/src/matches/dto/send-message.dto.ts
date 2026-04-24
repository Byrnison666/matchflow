import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class SendMessageDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType = MessageType.TEXT;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
