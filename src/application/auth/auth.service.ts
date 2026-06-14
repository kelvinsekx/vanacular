import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { UsersService } from 'src/application/users/users.service';
import { LoginDto } from 'src/application/users/users.dto';
import { LanguagesService } from 'src/application/languages/languages.service';
import { User, Prisma } from 'src/generated/prisma/client';

type TokenExpiry = {
  token: string;
  expiry: number;
};

@Injectable()
export class AuthService {
  methodName = 'AuthService';

  passwordService = new PasswordService();
  private readonly logger = new Logger();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private langService: LanguagesService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<User> | null> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      this.logger.debug(
        `[${this.methodName}] - Failed to Login- Email and password do not match`,
      );
      throw new BadRequestException({
        message: "Email or password don't match",
      });
    }

    const isTaly = await this.passwordService.compareHashPassword(
      password,
      user.password,
    );

    if (user && isTaly) {
      const data: Partial<User> = { ...user };
      delete data.password;
      return data;
    }

    return null;
  }

  async login(user: LoginDto) {
    const methodName = 'login';
    const startTime = Date.now();
    try {
      if (!user) {
        this.logger.warn(
          `[${methodName}] - Login attempted with null/undefined user`,
        );
        throw new UnauthorizedException('User credentials are required');
      }

      this.logger.log(
        `[${methodName}] - Login attempt for email: ${user.email}`,
      );

      const loggedInUser = await this.usersService.findOneByEmail(user.email);

      const payload = {
        class: loggedInUser?.memberships,
        email: loggedInUser?.email,
        sub: loggedInUser?.id,
        jti: uuidv4(),
        role: loggedInUser?.role,
      };

      this.logger.debug(
        `[${methodName}] - Generating JWT for user ${payload.sub}`,
      );

      const access_token = this.jwtService.sign(payload);

      const duration = Date.now() - startTime;
      this.logger.log(
        `[${methodName}] - Login successful for user ${payload.sub} (${payload.email}) - took ${duration}ms`,
      );

      return { data: { access_token } };
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(
        `[${methodName}] - Unexpected error after ${duration}ms: ${errorMessage}`,
        {
          error: err as string,
          errorStack: err instanceof Error ? err.stack : undefined,
          email: user?.email,
        },
      );
      throw err;
    }
  }

  async signup(firstTimeUser: Prisma.UserCreateInput, targetLanguage: number) {
    const methodName = 'signup';
    const startTime = Date.now();

    const user = await this.usersService.findOneByEmail(firstTimeUser.email);

    if (user) {
      const timeTaken = Date.now() - startTime;
      this.logger.warn(
        `[${methodName}] - Signup failed cause user already exist - ${firstTimeUser.email} (took ${timeTaken}ms)`,
      );

      throw new BadRequestException({
        message: 'user already exist',
        field: `C ${AuthService.name} signup`,
        email: firstTimeUser.email,
      });
    }

    this.logger.debug(
      `[${methodName}] - User does not exist, proceeding with registration`,
    );

    const hashedPassword = await this.passwordService.hassPasword(
      firstTimeUser.password,
    );

    firstTimeUser = { ...firstTimeUser, password: hashedPassword };

    const isTargetLanguageExist =
      await this.langService.findLanguage(targetLanguage);

    if (!isTargetLanguageExist.data) {
      this.logger.debug(
        `User can not signup because target language: ${targetLanguage} is not valid`,
      );
      throw new NotFoundException(
        'Can not signup because target language do not exist',
      );
    }

    this.logger.debug(
      `[${methodName}] - Creating user in database for ${firstTimeUser.email}`,
    );

    const registeredNewUser =
      await this.usersService.registerUser(firstTimeUser);

    await this.usersService.setupNewLearnerAccount({
      email: registeredNewUser.email,
      userId: registeredNewUser.id,
    });

    return this.login(firstTimeUser);
  }

  async logout({ token, expiry }: TokenExpiry) {
    return await this.blacklistToken({ token, expiry });
  }

  async blacklistToken({ token, expiry }: TokenExpiry) {
    const ttl = Math.floor(expiry) - Math.floor(Date.now() / 1000);

    if (ttl > 0) {
      await this.redis.set(`jwt:${token}`, '1', 'EX', ttl);
    }
  }
}

export class PasswordService {
  salt = Number(process.env.AUTH_SALT);

  async hassPasword(passwordTxt: string) {
    return await bcrypt.hash(passwordTxt, this.salt);
  }

  async compareHashPassword(plainTxt: string, passwordHash: string) {
    return await bcrypt.compare(plainTxt, passwordHash);
  }
}
