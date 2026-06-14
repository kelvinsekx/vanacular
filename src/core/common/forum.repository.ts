import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma.service';

@Injectable()
export class ForumRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.forum.findUnique({
      where: { id },
    });
  }

  async canUserSendMessage({
    forumId,
    userId,
  }: {
    forumId: string;
    userId: string;
  }) {
    return this.prisma.membership.findFirst({
      where: {
        class: {
          forumId,
        },
        user: {
          id: userId,
        },
      },
    });
  }
}
