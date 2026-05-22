import {
  IsString,
  IsBoolean,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
  ArrayMinSize,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

enum ActivityType {
  MULTI_CHOICE = 'MULTI_CHOICE',
  IMAGE_CHOICE = 'IMAGE_CHOICE',
}

class HintDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  order?: number;
}

export class MultipleChoiceOptionDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  assetId?: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsOptional()
  @IsInt()
  position?: number;
}

export class UpdateOptionParamsDto {
  @IsNumberString()
  optionId: number;
}

class BaseActivityDto {
  @IsEnum(ActivityType)
  type: ActivityType;

  @IsOptional()
  @IsInt()
  xpReward?: number;
}

export class CreateMultiChoiceActivityDto extends PartialType(BaseActivityDto) {
  type: ActivityType.MULTI_CHOICE | ActivityType.IMAGE_CHOICE;

  @IsInt()
  @Min(0)
  order: number;

  @IsString()
  prompt: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => MultipleChoiceOptionDto)
  options: MultipleChoiceOptionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HintDto)
  hints: HintDto[];
}

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsInt()
  order: number;

  @IsString()
  forumId: string;
}

export class UpdateMultiActivityDto extends PartialType(
  CreateMultiChoiceActivityDto,
) {}
