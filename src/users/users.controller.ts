import {
  Controller,
  UseGuards,
  Get,
  Req,
  Query,
  Post,
  Param,
  Sse,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { type RequestWithPassportUser } from 'src/auth/jwt.strategy';

import { UsersService } from './users.service';
import { LessonsService } from 'src/lessons/lessons.service';
import { JobsService } from 'src/core/job-service';

@Controller('users')
export class UsersController {
  constructor(
    readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly lessonService: LessonsService,
    private jobService: JobsService,
  ) {}

  @Get()
  async getAllUsers(@Query('take') take = 10) {
    return await this.prisma.user.findMany({
      take: take,
    });
  }

  @Post('/account/setup')
  @UseGuards(JwtAuthGuard)
  setupAccount() {
    const jobId = randomUUID();
    this.jobService.createJob(jobId);
    return { jobId };
  }

  @Post('/account/setup/start/:jobId')
  @UseGuards(JwtAuthGuard)
  start(@Param('jobId') jobId: string, @Req() req: RequestWithPassportUser) {
    void this.usersService.setupNewLearnerAccount(req.user, jobId);
    return {
      started: true,
    };
  }

  @Sse('jobs/:jobId/stream')
  stream(@Param('jobId') jobId: string) {
    return this.jobService.getJobStream(jobId);
  }

  @Post('jobs/:jobId/test')
  test(@Param('jobId') jobId: string) {
    this.jobService.emit(jobId, {
      step: 'Testing',
    });

    return { ok: true };
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
