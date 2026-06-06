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
import { LocalAuthGuard } from './auth/local-auth.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuthService } from './auth/auth.service';
import { type User } from './../src/generated/prisma/client';

import { CreateUserDto } from './users/users.dto';
import { type RequestWithPassportUser } from './auth/jwt.strategy';
import { ClassRepository } from './core/common/classes.repository';

@Controller()
export class AppController {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly appService: AppService,
    private authService: AuthService,
    private readonly classRepo: ClassRepository,
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

  @Get('/get-classes')
  async getAllClasses() {
    return this.classRepo.getAllClasses();
  }
}
