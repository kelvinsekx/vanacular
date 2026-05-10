import {
  Controller,
  UseGuards,
  Get,
  Req,
  Query,
  Post,
  Param,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { type RequestWithPassportUser } from 'src/auth/jwt.strategy';

import { UsersService } from './users.service';
import { LessonsService } from 'src/lessons/lessons.service';

@Controller('users')
export class UsersController {
  constructor(
    readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly lessonService: LessonsService,
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

  @Get('next-lesson')
  @UseGuards(JwtAuthGuard)
  async getNextLessonsForUser(@Req() req: RequestWithPassportUser) {
    return await this.lessonService.getNextActivityForUser({
      userId: req.user.userId,
      classId: req.user.classes[0].id,
    });
  }

  @Post('activity/:activityId/complete')
  @UseGuards(JwtAuthGuard)
  async completeActivity(
    @Param('activityId') activityId: string,
    @Req() req: RequestWithPassportUser,
  ) {
    return this.lessonService.markActivityAsCompleted(
      req.user.userId,
      activityId,
    );
  }
}
