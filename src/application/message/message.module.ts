import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

import { UsersService } from 'src/application/users/users.service';
import { SendMessageUseCase } from './message.service';
import { GetMessagesUseCase } from './use-cases/get-message.use-case';
import { MessageRepository } from 'src/core/messages.repository';
import { ClassRepository } from 'src/core/common/classes.repository';
import { JobsService } from 'src/core/job-service';
import { ChatWsGateway } from 'src/ws/gateways/chat-ws.gateway';

@Module({
  controllers: [MessageController],
  providers: [
    MessageService,
    UsersService,
    SendMessageUseCase,
    GetMessagesUseCase,
    ClassRepository,
    MessageRepository,
    JobsService,
    ChatWsGateway,
  ],
})
export class MessageModule {}
