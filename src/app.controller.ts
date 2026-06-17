import {
  Controller,
  Request,
  Body,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

import { AppService } from './../src/app.service';
import { LocalAuthGuard } from './application/auth/local-auth.guard';
import { JwtAuthGuard } from './application/auth/jwt-auth.guard';
import { AuthService } from './application/auth/auth.service';
import { type User } from './../src/generated/prisma/client';

import { CreateUserDto } from './application/users/users.dto';
import { type RequestWithPassportUser } from './application/auth/jwt.strategy';

@Controller()
export class AppController {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly appService: AppService,
    private authService: AuthService,
  ) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('/ping')
  async ping() {
    await this.redis.set('key', 'pong');
    const k = await this.redis.get('key');
    return { message: k };
  }

  @Post('auth/signup')
  signup(@Body() body: CreateUserDto) {
    const { targetLanguage, ...rest } = body;
    return this.authService.signup(
      {
        ...rest,
        targetLanguage: {
          connect: { id: targetLanguage },
        },
      },
      targetLanguage,
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  login(@Request() req: RequestWithPassportUser) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/logout')
  async logout(
    @Request() req: { user: User & { expiry: number; jti: string } },
  ) {
    await this.authService.logout({
      token: req.user.jti,
      expiry: req.user.expiry,
    });
    return { message: 'Logged out successfully' };
  }
}
