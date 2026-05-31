import { IsString, IsNumber } from 'class-validator';

/**
 * name: string
 * languageId: number
 */
export class CreateForumDto {
  @IsString()
  name: string;

  @IsNumber()
  languageId: number;
}
