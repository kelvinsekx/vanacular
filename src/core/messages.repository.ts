import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { type SendMessageCommand } from 'src/message/message.service';

export interface QueryOptions {
  take: number;
  cursor: string | null;
}

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByForumId(forumId: string, queryOptions: QueryOptions) {
    const messages = await this.prisma.post.findMany({
      where: { forumId },
      take: queryOptions.take + 1,
      ...(queryOptions.cursor && {
        cursor: { id: queryOptions.cursor },
        skip: 1,
      }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    let hasMore = false,
      nextCursor: string | null = null;

    if (messages.length > queryOptions.take) {
      hasMore = true;
      const nextItem = messages.pop();
      nextCursor = nextItem!.id;
    }

    const total = await this.prisma.post.count({ where: { forumId } });

    return {
      data: messages,
      total,
      hasMore,
      nextCursor,
    };
  }

  async createMessage(
    c: Pick<SendMessageCommand, 'content' | 'forumId' | 'userId'>,
  ) {
    return this.prisma.post.create({
      data: {
        content: c.content,
        forumId: c.forumId,
        authorId: c.userId,
      },
    });
  }
}
