import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma.service';
import { classSelect } from '../utils/prisma/selects';

@Injectable()
export class ClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllClasses() {
    return {
      data: await this.prisma.class.findMany({
        take: 15,
        select: classSelect,
      }),
    };
  }

  async getAllClassesInForum(forumId: string) {
    return await this.prisma.class.findMany({
      where: { forumId },
    });
  }

  async canUserSendMessage({
    classId,
    userId,
  }: {
    classId: string;
    userId: string;
  }) {
    return this.prisma.membership.findFirst({
      where: {
        class: {
          id: classId,
        },
        user: {
          id: userId,
        },
      },
    });
  }
  async getUserClass(userId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
      },
      include: {
        class: {
          select: {
            id: true,
            level: true,
            name: true,
            minPoints: true,
            forum: true,
          },
        },
      },
    });
    return membership?.class;
  }

  async findOneById(id: string) {
    return await this.prisma.class.findUnique({
      where: { id },
      select: classSelect,
    });
  }
}
