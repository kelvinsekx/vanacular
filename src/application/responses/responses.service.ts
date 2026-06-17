import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { PrismaService } from 'src/infra/database/prisma.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { getErrorMessage } from 'src/core/utils/uti';
import { text } from 'stream/consumers';

interface AddResponse {
  messageId: string;
  userId: string;
  dto: CreateResponseDto;
}
@Injectable()
export class ResponsesService {
  private readonly logger = new Logger(ResponsesService.name);
  private readonly MAX_RESPONSES = 3;

  constructor(
    private readonly prisma: PrismaService,
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  async addResponse({ messageId, userId, dto }: AddResponse) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT id
        FROM "Chat"
        WHERE id = ${messageId}
        FOR UPDATE
      `;

      const message = await tx.chat.findUnique({ where: { id: messageId } });
      if (!message) throw new NotFoundException('Message not found');

      const count = await tx.response.count({ where: { chatId: messageId } });
      if (count >= this.MAX_RESPONSES) {
        throw new ForbiddenException(
          `A message can have at most ${this.MAX_RESPONSES} responses`,
        );
      }

      const response = await tx.response.create({
        data: {
          content: dto.content,
          chatId: messageId,
          userId,
          voteCount: 0,
        },
      });

      const redisKey = `message:${messageId}:responses`;

      try {
        await this.redis.zadd(redisKey, 0, response.id);
      } catch (err) {
        this.logger.error(`Redis update failed: ${getErrorMessage(err)}`);
      }

      return { data: response };
    });
  }

  toggleVote(responseId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const response = await tx.response.findUnique({
        where: { id: responseId },
        select: {
          id: true,
          chatId: true,
        },
      });

      if (!response) throw new NotFoundException(`Response not found`);

      const existingVote = await tx.vote.findUnique({
        where: { userId_responseId: { userId, responseId } },
      });

      const redisKey = `message:${response.chatId}:responses`;

      if (existingVote) {
        await tx.vote.delete({
          where: {
            id: existingVote.id,
          },
        });
        await tx.response.update({
          where: { id: responseId },
          data: { voteCount: { decrement: 1 } },
        });

        try {
          await this.redis.zincrby(redisKey, -1, responseId);
        } catch (err) {
          this.logger.error(`Redis zincryby failed: ${getErrorMessage(err)}`);
        }
        return { voted: false };
      }

      await tx.vote.create({ data: { userId, responseId } });
      await tx.response.update({
        where: { id: responseId },
        data: { voteCount: { increment: 1 } },
      });

      try {
        await this.redis.zincrby(redisKey, 1, responseId);
      } catch (err) {
        this.logger.error(`Redis zincryby failed: ${getErrorMessage(err)}`);
      }
      return { voted: true };
    });
  }

  async getResponses(messageId: string) {
    const redisKey = `message:${messageId}:responses`;

    const exists = await this.redis.exists(redisKey);

    let responseIds: string[] = [];

    if (exists) {
      responseIds = await this.redis.zrevrange(redisKey, 0, -1);
    }

    if (!responseIds.length) {
      const dbResponses = await this.prisma.response.findMany({
        where: { chatId: messageId },
        orderBy: { voteCount: 'desc' },
      });

      if (dbResponses.length) {
        const args = dbResponses.flatMap((r) => [r.voteCount, r.id]);
        try {
          await this.redis.zadd(redisKey, ...args);
          await this.redis.expire(redisKey, 2400);
        } catch (err) {
          this.logger.error(
            `Redis cahe rebuild failed: ${getErrorMessage(err)}`,
          );
        }
      }
      return dbResponses;
    }

    const responses = await this.prisma.response.findMany({
      where: { id: { in: responseIds } },
    });

    const responseMap = new Map(responses.map((r) => [r.id, r]));

    return responseIds
      .map((id) => responseMap.get(id))
      .filter((r) => r != null);
  }
}
