import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

import { UsersService } from 'src/application/users/users.service';
import { SendMessageUseCase } from './message.service';
import { GetMessagesUseCase } from './use-cases/get-message.use-case';
import { ForumRepository } from 'src/core/common/forum.repository';
import { MessageRepository } from 'src/core/messages.repository';
import { JobsService } from 'src/core/job-service';

@Module({
  controllers: [MessageController],
  providers: [
    MessageService,
    UsersService,
    SendMessageUseCase,
    GetMessagesUseCase,
    ForumRepository,
    MessageRepository,
    JobsService,
  ],
})
export class MessageModule {}
