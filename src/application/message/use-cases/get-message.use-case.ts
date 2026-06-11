import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ForumRepository } from 'src/core/common/forum.repository';
import { UsersService } from 'src/application/users/users.service';
import {
  MessageRepository,
  type QueryOptions,
} from 'src/core/messages.repository';

export interface GetMessagesCommand {
  forumId: string;
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
  //  private readonly logger = new Logger(GetMessagesUseCase.name);

  constructor(
    private readonly forumRepo: ForumRepository,
    private readonly userRepo: UsersService,
    private readonly messageRepo: MessageRepository,
  ) {}

  async exec(c: GetMessagesCommand) {
    // const startTime = Date.now();

    const [forum, user] = await Promise.all([
      this.forumRepo.findById(c.forumId),
      this.userRepo.findOneById(c.userId),
    ]);

    if (!forum)
      throw new NotFoundException({
        message: 'This is not a valid Forum to fetch chats',
        field: 'C GetMessagesUseCase P exec',
      });

    if (!user)
      throw new UnauthorizedException({
        message: 'You are not authenticated to get chats in this forum',
        field: 'C GetMessagesUseCase P exec',
      });

    const canParticipate = await this.forumRepo.canUserSendMessage({
      forumId: c.forumId,
      userId: c.userId,
    });

    if (!canParticipate)
      throw new UnauthorizedException('User is not a member of this room');

    const MessageResult = await this.fetchMessagesWithPagination(c.forumId);

    return MessageResult;
  }

  private async fetchMessagesWithPagination(
    forumId: string,
    params?: QueryOptions,
  ) {
    // const startTime = Date.now();

    const queryOptions = {
      take: params?.take || 10,
      cursor: params?.cursor || null,
    };

    const { total, hasMore, nextCursor, data } =
      await this.messageRepo.findByForumId(forumId, queryOptions);

    return {
      data,
      total,
      hasMore,
      nextCursor,
    };
  }
}
