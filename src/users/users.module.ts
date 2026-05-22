import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { LanguagesService } from 'src/languages/languages.service';
import { LanguageRepository } from 'src/core/common/language.repository';
import { UsersProfileController } from './users-profile.controller';
import { UsersProfileService } from './users-profile.service';
import { UsersController } from './users.controller';
import { ClassRepository } from 'src/core/common/classes.repository';
import { LessonsService } from 'src/lessons/lessons.service';
import { JobsService } from 'src/core/job-service';

@Module({
  providers: [
    UsersService,
    LanguagesService,
    LanguageRepository,
    UsersProfileService,
    ClassRepository,
    LessonsService,
    JobsService,
  ],
  exports: [UsersService],
  controllers: [UsersProfileController, UsersController],
})
export class UsersModule {}
