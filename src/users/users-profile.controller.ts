import {
  Controller,
  Get,
  Body,
  Patch,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UsersProfileService } from './users-profile.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

import { UpdateUserDto } from './users.dto';

@Controller('users/me/profile')
export class UsersProfileController {
  constructor(private readonly usersProfileService: UsersProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfileSettings(@Request() req) {
    return await this.usersProfileService.getAUserProfileAndSettings(
      req.user.email,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stats')
  async getAUserStats() {
    return this.usersProfileService.getAUserStatsAndHistory();
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateProfileSettings(@Body() body: UpdateUserDto, @Request() req) {
    if (!body)
      throw new BadRequestException('req.body object is empty or undefined');
    return this.usersProfileService.updateUserProfile(req.user.email, body);
  }
}
