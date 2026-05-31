import {
  IsEmail,
  IsString,
  IsOptional,
  Length,
  IsUrl,
  IsNumber,
  MinLength,
} from 'class-validator';

/**
 * create user dto (onboarding)
 * @param email - email type of String.
 * @param targetLanguage - foreign key of Int
 * @param password - String
 */
export class CreateUserDto {
  @IsEmail()
  readonly email: string;

  @IsNumber()
  readonly targetLanguage: number;

  @IsString()
  @MinLength(8)
  readonly password: string;
}

/**
 * update user dto (profile/settings)
 * @param email - email of type String.
 * @param bio - String with max length of 160
 * @param avatarUrl - Url of type String
 * @Param firstName - String
 * @param lastName - String
 * @param phone - String
 * @param learningObjective - String
 * @param nativeLanguage - String
 * @param dailyXpGoal - Int
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(0, 160)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  phone?: string;

  @IsOptional()
  @IsString()
  learningObjective?: string;

  @IsOptional()
  @IsString()
  nativeLanguange?: string;

  @IsOptional()
  @IsNumber()
  dailyXpGoal?: number;
}

/**
 * Login Dto
 *
 * @param email string
 * @param password string with min length of 8
 * */
export class LoginDto {
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  readonly password?: string;
}
