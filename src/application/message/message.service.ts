import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SendMessageDto, MessageResponseDto } from './message.dto';

import { UsersService } from 'src/application/users/users.service';
import { RequestWithPassportUser } from 'src/application/auth/jwt.strategy';

import { GetMessagesUseCase } from './use-cases/get-message.use-case';
import { type GetMessagesCommand } from './use-cases/get-message.use-case';
import { SendMessageUseCase } from './use-cases/send-message.use-case';
import { PrismaService } from 'src/infra/database/prisma.service';
import { FetchMessageSelect } from 'src/core/utils/prisma/selects';

@Injectable()
export class MessageService {
  private logger = new Logger(MessageService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getMessageUseCase: GetMessagesUseCase,
    private readonly prisma: PrismaService,
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

  async getMessage(classId: string, chatId: string) {
    return await this.prisma.chat.findFirst({
      where: { classId, id: chatId },
      select: FetchMessageSelect,
    });
  }
}
