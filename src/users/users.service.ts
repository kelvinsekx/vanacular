import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User } from './../generated/prisma/client';

@Injectable()
export class UsersService {
  private logger = new Logger();

  constructor(private prisma: PrismaService) {}

  async registerUser(data: Prisma.UserCreateInput) {
    return await this.prisma.user.create({ data });
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },

      include: {
        memberships: {
          orderBy: {
            class: {
              level: 'asc',
            },
          },
          select: {
            class: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
          },
        },
      },
    });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  updateUser(userEmail: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { email: userEmail },
      data,
    });
  }

  deleteUser() {
    return 'DELETED';
  }

  async setupNewLearnerAccount(student: {
    email: string;
    userId: string | undefined;
  }) {
    const methodName = 'onsetupNewLearnerAccount';
    const startTimer = Date.now();

    this.logger.log(`[${methodName}] - find user first`);

    const user = await this.prisma.user.findUnique({
      where: {
        email: student.email,
      },
      include: {
        targetLanguage: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    if (!user) {
      this.logger.debug(
        `[${methodName}] - couldn't find user with ${student.email}`,
      );
      throw new UnauthorizedException();
    }

    if (typeof user.targetLanguageId !== 'number') {
      this.logger.debug(
        `[${methodName}] - on user (${student.email}) setup, an invalid language ID was used`,
      );
      throw new NotFoundException('This is not a valid language id');
    }

    const isExistingMember = await this.prisma.membership.findFirst({
      where: {
        userId: student.userId,
      },
    });

    if (isExistingMember) {
      this.logger.debug(
        `[${methodName}] - user with email (${student.email}) already belong to a forum`,
      );
      throw new UnauthorizedException({
        message: 'This user is already setup',
      });
    }

    this.logger.log(
      `[${methodName}] - user do not belong to any class/forum -  proceed to setup user to forum and class`,
    );

    return this.prisma.$transaction(async (tx) => {
      const forum = await tx.forum.findFirst({
        where: {
          language: { id: user.targetLanguage?.id },
        },
        include: {
          classes: {
            where: {
              level: 1,
            },
          },
        },
      });

      if (!forum || !forum.classes.length) {
        this.logger.debug(
          `[${methodName}] - No class in this forum. ADMIN CORE (took ${Date.now() - startTimer} ms)`,
        );
        throw new NotFoundException(
          `No class available for ${user.targetLanguage?.name}. Sorry, this is our fault. Our facilitator will work on this and let you know.`,
        );
      }

      const targetClass = forum.classes[0];

      this.logger.log(
        `[${methodName}] - Adding user to class - ${targetClass.name}`,
        {
          forumClass: targetClass,
        },
      );

      await tx.membership.create({
        data: {
          userId: user.id,
          classId: targetClass.id,
          role: 'STUDENT',
        },
      });

      const timer = Date.now() - startTimer;
      this.logger.debug(
        `[${methodName}] - successfully setup user to classes and forum (took ${timer}ms)`,
      );

      return {
        data: {
          enrolledIn: targetClass.name,
          forumId: targetClass.forumId,
          language: user.targetLanguage?.name,
        },
        success: true,
      };
    });
  }
}
