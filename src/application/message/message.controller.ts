import {
  Controller,
  Param,
  Request,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { type RequestWithPassportUser } from 'src/application/auth/jwt.strategy';
import { SendMessageDto } from './message.dto';
import { JwtAuthGuard } from 'src/application/auth/jwt-auth.guard';
import { MessageService } from './message.service';
import { PrismaService } from 'src/infra/database/prisma.service';
import { ChatWsGateway } from 'src/ws/gateways/chat-ws.gateway';

@Controller('rooms/:classId/message')
@UseGuards(JwtAuthGuard)
export class MessageController {
  private logger = new Logger(MessageController.name);

  constructor(
    private readonly messageService: MessageService,
    private readonly chatWsGateway: ChatWsGateway,
  ) {}

  @Post()
  async sendMessage(
    @Param('classId') classId: string,
    @Request() req: RequestWithPassportUser,
    @Body() dto: SendMessageDto,
  ) {
    const savedChat = await this.messageService.sendMsg({
      classId,
      user: req.user,
      dto,
    });

    if (!savedChat) {
      this.logger.debug(`problem saving a chat`);
      throw new Error(`message: we could not save this message`);
    }

    const msg = await this.getMessage(classId, savedChat.contentId);

    await this.chatWsGateway.broadcastToClasses({
      classId,
      data: msg,
    });
    return { data: { success: true } };
  }

  @Get()
  async getMessages(
    @Param('classId') classId: string,
    @Request() req: RequestWithPassportUser,
    @Query('take') take: number,
  ) {
    return await this.messageService.getMessages({
      classId,
      userId: req.user.userId,
      take,
    });
  }

  @Get('/:chatId')
  async getMessage(
    @Param('classId') classId: string,
    @Param('chatId') chatId: string,
  ) {
    return await this.messageService.getMessage(classId, chatId);
  }
}
