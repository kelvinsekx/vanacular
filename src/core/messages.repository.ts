import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma.service';
import { type SendMessageCommand } from 'src/application/message/message.service';

export interface QueryOptions {
  take: number;
  cursor: string | null;
}

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByClass(classId: string, queryOptions: QueryOptions) {
    const messages = await this.prisma.chat.findMany({
      where: { classId },
      select: {
        id: true,
        content: true,
        author: {
          select: {
            username: true,
            id: true,
          },
        },
        createdAt: true,
      },
      take: queryOptions.take + 1,
      ...(queryOptions.cursor && {
        cursor: { id: queryOptions.cursor },
        skip: 1,
      }),
      orderBy: [{ createdAt: 'desc' }],
    });

    let hasMore = false,
      nextCursor: string | null = null;

    if (messages.length > queryOptions.take) {
      hasMore = true;
      const nextItem = messages.pop();
      nextCursor = nextItem!.id;
    }

    const total = await this.prisma.chat.count({ where: { classId } });

    return {
      data: messages.reverse(),
      total,
      hasMore,
      nextCursor,
    };
  }

  async createMessage(
    c: Pick<SendMessageCommand, 'content' | 'classId' | 'userId'>,
  ) {
    return await this.prisma.chat.create({
      data: {
        content: c.content,
        classId: c.classId,
        authorId: c.userId,
      },
    });
  }
}
