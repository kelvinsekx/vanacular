import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma.service';

@Injectable()
export class ClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllClasses() {
    return {
      data: await this.prisma.class.findMany({
        take: 15,
        select: {
          id: true,
          name: true,
          level: true,
          minPoints: true,
          forum: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      }),
    };
  }

  async getAllClassesInForum(forumId: string) {
    return await this.prisma.class.findMany({
      where: { forumId },
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
}
