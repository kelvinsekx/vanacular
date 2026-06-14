import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { UsersService } from 'src/application/users/users.service';
import { SendMessageDto, MessageResponseDto, MessageType } from './message.dto';
import { RequestWithPassportUser } from 'src/application/auth/jwt.strategy';

import { MessageRepository } from 'src/core/messages.repository';
import { ClassRepository } from 'src/core/common/classes.repository';
import { GetMessagesUseCase } from './use-cases/get-message.use-case';
import { type GetMessagesCommand } from './use-cases/get-message.use-case';

export interface SendMessageCommand {
  classId: string;
  userId: string;
  content: string;
  type: MessageType;
}

@Injectable()
export class SendMessageUseCase {
  private logger = new Logger(SendMessageUseCase.name);

  constructor(
    private readonly classRepo: ClassRepository,
    private readonly messageRepo: MessageRepository,
  ) {}

  async exec(c: SendMessageCommand) {
    const methodName = 'exec';

    const classforum = await this.classRepo.findById(c.classId);

    if (!classforum) {
      this.logger.debug(
        `[${methodName}] - user trying to access chats from class that do not exist.`,
      );
      throw new NotFoundException({
        message: 'This is not a valid forum to send chat',
        field: 'C SendMessageUseCase.exec P c: SendMessageCommand',
      });
    }

    const canSendMessage = await this.classRepo.canUserSendMessage({
      classId: c.classId,
      userId: c.userId,
    });

    if (!canSendMessage) {
      this.logger.debug(
        `[${methodName}] - user trying to access chats from class they are not a part of`,
      );
      throw new UnauthorizedException({
        message: 'You are not authorized to chat in this forum',
        field: 'C SendMessageUseCase P c: SendMessageCommand',
      });
    }

    return await this.saveMessage(c);
  }

  saveMessage(c: Pick<SendMessageCommand, 'classId' | 'userId' | 'content'>) {
    return this.messageRepo.createMessage(c);
  }
}

@Injectable()
export class MessageService {
  private logger = new Logger(MessageService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getMessageUseCase: GetMessagesUseCase,
  ) {}

  async sendMsg({
    classId,
    user,
    dto,
  }: {
    classId: string;
    user: RequestWithPassportUser['user'] | null;
    dto: SendMessageDto;
  }) {
    const sender = await this.usersService.findOneByEmail(user?.email ?? '');

    if (!sender) throw new NotFoundException('User not found');

    const result = await this.sendMessageUseCase.exec({
      classId,
      userId: sender.id,
      content: dto.content,
      type: dto.type,
    });

    if (result) return MessageResponseDto.fromDomain(result, sender);
  }

  async getMessages({ classId, take, userId }: GetMessagesCommand) {
    const methodName = 'getMessages';
    const sender = await this.usersService.findOneById(userId ?? '');

    if (!sender) {
      this.logger.debug(
        `[${methodName}] - user that do not exist (${userId}) tried to fetch messages`,
      );
      throw new NotFoundException('User not found');
    }

    this.logger.log(
      `[${methodName}] - exec to fetch messages for a user (${sender.email})`,
    );
    const result = await this.getMessageUseCase.exec({
      classId,
      take,
      userId,
    });

    return result;
  }
}
