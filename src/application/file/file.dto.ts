import { IsString, IsOptional } from 'class-validator';

export class FileCreateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  alt?: string;
}
