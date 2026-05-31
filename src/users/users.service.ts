import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User } from './../generated/prisma/client';
import { RequestWithPassportUser } from 'src/auth/jwt.strategy';
import { JobsService } from 'src/core/job-service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jobService: JobsService,
  ) {}

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

  async setupNewLearnerAccount(
    student: RequestWithPassportUser['user'],
    jobId: string,
  ) {
    this.jobService.emit(jobId, {
      data: {
        step: 'Setting up your profile',
      },
    });

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

    if (!user) throw new UnauthorizedException();
    if (typeof user.targetLanguageId !== 'number')
      throw new NotFoundException('This is not a valid language id');

    const isExistingMember = await this.prisma.membership.findFirst({
      where: {
        userId: student.userId,
      },
    });

    if (isExistingMember)
      throw new UnauthorizedException({
        message: 'This user is already setup',
      });

    this.jobService.emit(jobId, {
      data: {
        step: 'Creating a  forum and class for you',
      },
    });

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
        throw new NotFoundException(
          `No class available for ${user.targetLanguage?.name}`,
        );
      }

      this.jobService.emit(jobId, {
        data: {
          step: 'Setting your lessons',
        },
      });

      const targetClass = forum.classes[0];

      await tx.membership.create({
        data: {
          userId: user.id,
          classId: targetClass.id,
          role: 'STUDENT',
        },
      });

      this.jobService.emit(jobId, {
        data: {
          step: 'Finish',
        },
      });

      return {
        jobId,
        enrolledIn: targetClass.name,
        forumId: targetClass.forumId,
        language: user.targetLanguage?.name,
      };
    });
  }
}
