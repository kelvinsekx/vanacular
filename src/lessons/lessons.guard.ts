import {
  Injectable,
  CanActivate,
  BadRequestException,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Request } from 'express';
import { Forum } from 'src/generated/prisma/client';

export interface ForumRequest extends Request {
  forum: Forum;
  body: {
    forumId: string;
  };
}

@Injectable()
export class ForumAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<ForumRequest>();

    const forumId = request.query.forumId;

    if (typeof forumId == 'object')
      throw new BadRequestException({
        message: 'forum params can not be an array',
      });

    if (!forumId)
      throw new BadRequestException({ message: 'forum ID is missing' });

    const forum = await this.prisma.forum.findUnique({
      where: { id: forumId },
    });

    if (!forum)
      throw new NotFoundException({
        message: 'The forum you are trying to fetch its lessons is not valid',
      });

    request.forum = forum;
    console.log(request.forum);
    return true;
  }
}
