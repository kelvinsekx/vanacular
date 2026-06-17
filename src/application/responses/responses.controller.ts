import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ResponsesService } from './responses.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { type RequestWithPassportUser } from '../auth/jwt.strategy';

@Controller()
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Post('messages/:messageId/responses')
  @UseGuards(JwtAuthGuard)
  addResponse(
    @Param('messageId') messageId: string,
    @Body() createResponseDto: CreateResponseDto,
    @Req() req: RequestWithPassportUser,
  ) {
    return this.responsesService.addResponse({
      messageId,
      userId: req.user.userId,
      dto: createResponseDto,
    });
  }

  @Get('messages/:messageId/responses')
  getResponses(@Param('messageId') messageId: string) {
    return this.responsesService.getResponses(messageId);
  }

  @Post('responses/:responseId/vote')
  @UseGuards(JwtAuthGuard)
  toggleVote(
    @Param('responseId') responseId: string,
    @Req() req: RequestWithPassportUser,
  ) {
    return this.responsesService.toggleVote(responseId, req.user.userId);
  }
}
