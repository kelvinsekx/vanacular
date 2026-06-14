import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { User } from 'src/generated/prisma/client';

export enum MessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  SYSTEM = 'system',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum CorrectionType {
  GRAMMAR = 'grammar',
  VOCABULARY = 'vocabulary',
  PRONUNCIATION = 'pronunciation',
  SPELLING = 'spelling',
}

export class SendMessageDto {
  /**
   * content : strng
   */
  @IsString()
  content: string;

  @IsEnum(MessageType)
  type: MessageType;
}

export class SenderDto {
  @IsString()
  id: string;

  @IsString()
  username: string;

  @IsString()
  nativeLanguage: string;

  @IsString()
  learningLanguage: number;
}

export class LanguageCorrectDto {
  @IsString()
  original: string;

  @IsString()
  correction: string;

  @IsString()
  explanation: string;

  @IsString()
  type: string;
}

export class MessageResponseDto {
  @IsString()
  classId: string;

  @ValidateNested()
  @Type(() => SenderDto)
  sender?: SenderDto;

  @IsString()
  content: string;

  @IsString()
  contentId: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @IsNumber()
  createdAt: number;

  @IsOptional()
  corrections?: LanguageCorrectDto[];

  static fromDomain(
    message: Pick<MessageResponseDto, 'classId' | 'content'> & {
      id: string;
      createdAt: Date;
    },
    user: User,
  ) {
    const dto = new MessageResponseDto();
    dto.contentId = message.id;
    dto.classId = message.classId;
    dto.content = message.content;
    dto.sender = {
      id: user.id,
      nativeLanguage: user.nativeLanguage ?? '',
      learningLanguage: user.targetLanguageId ?? 0,
      username: user.username ?? '',
    };

    return dto;
  }
}
