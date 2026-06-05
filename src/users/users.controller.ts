import {
  Controller,
  UseGuards,
  Get,
  Req,
  Query,
  Post,
  Param,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { type RequestWithPassportUser } from 'src/auth/jwt.strategy';

import { UsersService } from './users.service';
import { LessonsService } from 'src/lessons/lessons.service';

@Controller('users')
export class UsersController {
  private logger = new Logger();
  constructor(
    readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly lessonService: LessonsService,
  ) {}

  @Get()
  async getAllUsers(@Query('take') take = 10) {
    return {
      data: await this.prisma.user.findMany({
        take: take,
      }),
    };
  }

  @Post('/account/setup')
  @UseGuards(JwtAuthGuard)
  async start(@Req() req: RequestWithPassportUser) {
    return await this.usersService.setupNewLearnerAccount(req.user);
  }

  @Get('next-lesson')
  @UseGuards(JwtAuthGuard)
  async getNextLessonsForUser(@Req() req: RequestWithPassportUser) {
    if (req.user.classes[0]) {
      return await this.lessonService.getNextActivityForUser({
        userId: req.user.userId,
        classId: req.user.classes[0].id,
      });
    }
    this.logger.debug(
      '[getNextLesson] - user trying to access lesson without setup',
    );
    throw new NotFoundException(
      "User is not registered to a class. May be you aren't setup yett setup yet.",
    );
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
