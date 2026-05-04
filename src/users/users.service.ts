import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User } from './../generated/prisma/client';
import { RequestWithPassportUser } from 'src/auth/jwt.strategy';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async registerUser(data: Prisma.UserCreateInput) {
    return await this.prisma.user.create({ data });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
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

  async setupNewLearnerAccount(student: RequestWithPassportUser['user']) {
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

      const targetClass = forum.classes[0];

      await tx.membership.create({
        data: {
          userId: user.id,
          classId: targetClass.id,
          role: 'STUDENT',
        },
      });

      return {
        enrolledIn: targetClass.name,
        forumId: targetClass.forumId,
        language: user.targetLanguage?.name,
      };
    });
  }
}
