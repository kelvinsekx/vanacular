import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClassRepository } from 'src/core/common/classes.repository';
import { MessageRepository } from 'src/core/messages.repository';
import { MessageType } from '../message.dto';

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

    const classforum = await this.classRepo.findOneById(c.classId);

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
