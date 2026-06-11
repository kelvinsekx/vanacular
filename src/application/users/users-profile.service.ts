import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { LanguagesService } from 'src/application/languages/languages.service';
import { ClassRepository } from 'src/core/common/classes.repository';
import { UpdateUserDto } from './users.dto';
import { removeUndefinedProps } from 'src/core/utils/uti';
import { User } from 'src/generated/prisma/client';

@Injectable()
export class UsersProfileService {
  private readonly logger = new Logger();
  constructor(
    private readonly usersService: UsersService,
    private readonly langService: LanguagesService,
    private readonly classRepo: ClassRepository,
  ) {}

  async getUserProfileAndSettings(userEmail: string) {
    const user: Partial<User> | null =
      await this.usersService.findOneByEmail(userEmail);

    if (!user) throw new UnauthorizedException();

    const lang = await this.langService.findLanguage(
      Number(user?.targetLanguageId),
    );

    const langClass = await this.classRepo.getUserClass(user?.id || '');

    delete user.password;
    delete user.role;
    delete user.targetLanguageId;

    return {
      user,
      learningLanguage: lang,
      fromLanguage: 'en',
      streak: 0,
      totalKantas: 0,
      lessonsCompleted: 0,
      langClass: langClass,
      joinedDate: user.createdAt,
      dailyGoal: user.dailyXpGoal,
      todayXp: 0,
      isPremiumUser: false,
      hasCompletedFirstLesson: false,
    };
  }

  getUserStatsAndHistory() {
    return {};
  }

  async updateUserProfile(userEmail: string, body: UpdateUserDto) {
    const methodName = 'updateUserProfile';
    try {
      if (!body) {
        this.logger.debug(
          `[${methodName}] - attempt to update user - ${userEmail} - with empty body request`,
        );
        throw new BadRequestException('req.body object is empty or undefined');
      }
      await this.usersService.updateUser(userEmail, removeUndefinedProps(body));
      this.logger.log(`[${methodName}] - updated user (${userEmail}) profile`);
      return { message: `Profile updated` };
    } catch (error) {
      this.logger.debug(
        `[${methodName}] - caught an error when trying to update user profile`,
        { stack: error as string },
      );
      throw new BadRequestException(error);
    }
  }
}
