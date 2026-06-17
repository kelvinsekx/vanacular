import { IsString } from 'class-validator';

export class CreateResponseDto {
  @IsString()
  content: string;
}
