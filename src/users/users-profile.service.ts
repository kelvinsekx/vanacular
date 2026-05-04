import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './users.dto';
import { removeUndefinedProps } from 'src/core/utils/uti';

@Injectable()
export class UsersProfileService {
  constructor(private readonly usersService: UsersService) {}

  async getAUserProfileAndSettings(userEmail: string) {
    return await this.usersService.findOneByEmail(userEmail);
  }

  async getAUserStatsAndHistory() {
    return {};
  }

  async updateUserProfile(userEmail: string, body: UpdateUserDto) {
    await this.usersService.updateUser(userEmail, removeUndefinedProps(body));
    return { message: `Profile updated` };
  }
}
