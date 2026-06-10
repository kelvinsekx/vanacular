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
import { type RequestWithPassportUser } from 'src/auth/jwt.strategy';
import { UpdateUserDto } from './users.dto';

@Controller('users/me/profile')
export class UsersProfileController {
  constructor(private readonly usersProfileService: UsersProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfileSettings(@Request() req: RequestWithPassportUser) {
    return await this.usersProfileService.getUserProfileAndSettings(
      req.user.email,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/stats')
  getUserStats() {
    return this.usersProfileService.getUserStatsAndHistory();
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateProfileSettings(
    @Body() body: UpdateUserDto,
    @Request() req: RequestWithPassportUser,
  ) {
    return this.usersProfileService.updateUserProfile(req.user.email, body);
  }
}
