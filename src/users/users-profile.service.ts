import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { LanguagesService } from 'src/languages/languages.service';
import { ClassRepository } from 'src/core/common/classes.repository';
import { UpdateUserDto } from './users.dto';
import { removeUndefinedProps } from 'src/core/utils/uti';

@Injectable()
export class UsersProfileService {
  constructor(
    private readonly usersService: UsersService,
    private readonly langService: LanguagesService,
    private readonly classRepo: ClassRepository,
  ) {}

  async getUserProfileAndSettings(userEmail: string) {
    /**
     * Return the following:
     * User's firstName and LastName
     * If User is on premium
     * If user has done their first lessons or not
     * Number of daily streaks
     *  Number of total accumulated kantas
     *
     * */
    const user = await this.usersService.findOneByEmail(userEmail);

    if (!user) throw new UnauthorizedException();

    const lang = await this.langService.findLanguage(user.targetLanguageId);

    const langClass = await this.classRepo.getUserClass(user.id);

    return {
      id: user.id,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      learningLanguage: lang,
      fromLanguage: 'en',
      streak: 0,
      totalKantas: 0,
      lessonsCompleted: 0,
      langClass: langClass,
      joinedDate: user.createdAt,
      dailyGoal: user.dailyXpGoal,
      todayXp: 0,
      hasCompletedFirstLesson: false,
    };
  }

  getUserStatsAndHistory() {
    return {};
  }

  async updateUserProfile(userEmail: string, body: UpdateUserDto) {
    await this.usersService.updateUser(userEmail, removeUndefinedProps(body));
    return { message: `Profile updated` };
  }
}
