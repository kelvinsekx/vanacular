import {
  Injectable,
  UnauthorizedException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from 'src/application/users/users.service';
import { ClassRepository } from 'src/core/common/classes.repository';
import {
  MessageRepository,
  type QueryOptions,
} from 'src/core/messages.repository';

export interface GetMessagesCommand {
  classId: string;
  userId: string;
  take: number;
}

/**
export interface GetMessagesResult {
  messages: Message[];
  forum: Forum;
  pagination: PaginationMetadata;
  userContext: UserMessageContext;
}
*/

/**
interface PaginationMetadata {
  total: number;
  limit: number;
  nextCursor?: Date;
  hasMore: boolean;
}
*/

@Injectable()
export class GetMessagesUseCase {
  private logger = new Logger(GetMessagesUseCase.name);

  constructor(
    private readonly classRepo: ClassRepository,
    private readonly userRepo: UsersService,
    private readonly messageRepo: MessageRepository,
  ) {}

  async exec(c: GetMessagesCommand) {
    const startTime = Date.now();
    const methodName = 'exec-GetMessages';

    const [classforum, user] = await Promise.all([
      this.classRepo.findById(c.classId),
      this.userRepo.findOneById(c.userId),
    ]);

    if (!classforum) {
      this.logger.debug(
        `[${methodName}] - can not fetch messages from class that do not exist`,
      );
      throw new NotFoundException({
        message: 'This is not a valid Forum to fetch chats',
        field: 'C GetMessagesUseCase P exec',
      });
    }

    if (!user) {
      throw new UnauthorizedException({
        message: 'You are not authenticated to get chats in this forum',
        field: 'C GetMessagesUseCase P exec',
      });
    }

    const canParticipate = await this.classRepo.canUserSendMessage({
      classId: c.classId,
      userId: c.userId,
    });

    if (!canParticipate) {
      this.logger.debug(
        `[${methodName}] - user is not permitted in this forum chats`,
      );
      throw new UnauthorizedException('User is not a member of this room');
    }
    const MessageResult = await this.fetchMessagesWithPagination(c.classId);

    this.logger.log(
      `[${methodName}] - successfully fetched messages in room (${c.classId}) & took ${Date.now() - startTime}ms`,
    );
    return MessageResult;
  }

  private async fetchMessagesWithPagination(
    classId: string,
    params?: QueryOptions,
  ) {
    const queryOptions = {
      take: params?.take || 10,
      cursor: params?.cursor || null,
    };

    const { total, hasMore, nextCursor, data } =
      await this.messageRepo.findByClass(classId, queryOptions);

    return {
      data,
      total,
      hasMore,
      nextCursor,
    };
  }
}
