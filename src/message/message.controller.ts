import {
  Controller,
  Param,
  Request,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { type RequestWithPassportUser } from 'src/auth/jwt.strategy';
import { SendMessageDto } from './message.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MessageService } from './message.service';

@Controller('rooms/:forumId/message')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async sendMessage(
    @Param('forumId') forumId: string,
    @Request() req: RequestWithPassportUser,
    @Body() dto: SendMessageDto,
  ) {
    return await this.messageService.sendMsg({
      forumId,
      user: req.user,
      dto,
    });
  }

  @Get()
  async getMessages(
    @Param('forumId') forumId: string,
    @Request() req: RequestWithPassportUser,
    @Query('take') take: number,
  ) {
    return await this.messageService.getMessages({
      forumId,
      userId: req.user.userId,
      take,
    });
  }
}
