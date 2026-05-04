import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersProfileController } from './users-profile.controller';
import { UsersProfileService } from './users-profile.service';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersService, UsersProfileService],
  exports: [UsersService],
  controllers: [UsersProfileController, UsersController],
})
export class UsersModule {}
