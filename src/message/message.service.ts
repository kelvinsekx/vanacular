import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { SendMessageDto, MessageResponseDto, MessageType } from './message.dto';
import { RequestWithPassportUser } from 'src/auth/jwt.strategy';

import { MessageRepository } from 'src/core/messages.repository';
import { ForumRepository } from 'src/core/common/forum.repository';

import { GetMessagesUseCase } from './use-cases/get-message.use-case';
import { type GetMessagesCommand } from './use-cases/get-message.use-case';

export interface SendMessageCommand {
  forumId: string;
  userId: string;
  content: string;
  type: MessageType;
}

@Injectable()
export class SendMessageUseCase {
  constructor(
    private readonly forumRepo: ForumRepository,
    private readonly messageRepo: MessageRepository,
  ) {}

  async exec(c: SendMessageCommand) {
    const forum = await this.forumRepo.findById(c.forumId);

    if (!forum)
      throw new NotFoundException({
        message: 'This is not a valid forum to send chat',
        field: 'C SendMessageUseCase.exec P c: SendMessageCommand',
      });

    const canSendMessage = await this.forumRepo.canUserSendMessage({
      forumId: c.forumId,
      userId: c.userId,
    });

    if (!canSendMessage)
      throw new UnauthorizedException({
        message: 'You are not authorized to chat in this forum',
        field: 'C SendMessageUseCase P c: SendMessageCommand',
      });

    return await this.saveMessage(c);
  }

  saveMessage(c: Pick<SendMessageCommand, 'forumId' | 'userId' | 'content'>) {
    return this.messageRepo.createMessage(c);
  }
}

@Injectable()
export class MessageService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getMessageUseCase: GetMessagesUseCase,
  ) {}

  async sendMsg({
    forumId,
    user,
    dto,
  }: {
    forumId: string;
    user: RequestWithPassportUser['user'] | null;
    dto: SendMessageDto;
  }) {
    const sender = await this.usersService.findOneByEmail(user?.email ?? '');

    if (!sender) throw new NotFoundException('User not found');

    const result = await this.sendMessageUseCase.exec({
      forumId,
      userId: sender.id,
      content: dto.content,
      type: dto.type,
    });

    if (result) return MessageResponseDto.fromDomain(result, sender);
  }

  async getMessages({ forumId, take, userId }: GetMessagesCommand) {
    const sender = await this.usersService.findOneById(userId ?? '');

    if (!sender) throw new NotFoundException('User not found');

    const result = await this.getMessageUseCase.exec({
      forumId,
      take,
      userId,
    });

    return result;
  }
}
