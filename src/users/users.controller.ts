import { Controller, UseGuards, Get, Req, Query } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { type RequestWithPassportUser } from 'src/auth/jwt.strategy';

import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getAllUsers(@Query('take') take = 10) {
    return await this.prisma.user.findMany({
      take: take,
    });
  }

  @Get('/setup-account')
  @UseGuards(JwtAuthGuard)
  async setupAccount(@Req() req: RequestWithPassportUser) {
    return await this.usersService.setupNewLearnerAccount(req.user);
  }
}
