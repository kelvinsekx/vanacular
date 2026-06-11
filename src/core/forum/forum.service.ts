import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { PrismaService } from 'src/infra/database/prisma.service';
import { LanguageRepository } from '../common/language.repository';
import { ClassRepository } from '../common/classes.repository';

@Injectable()
export class ForumService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classRepo: ClassRepository,
    private readonly languageRepo: LanguageRepository,
  ) {}

  async create(createForumDto: CreateForumDto) {
    const languageExists = await this.languageRepo.exists(
      createForumDto.languageId,
    );

    if (!languageExists) {
      throw new NotFoundException({
        message: 'Language not found',
        field: 'languageId',
        value: createForumDto.languageId,
      });
    }

    return this.prisma.forum.create({
      data: {
        name: createForumDto.name,
        languageId: createForumDto.languageId,
        classes: {
          create: [
            {
              level: 1,
              name: 'Basic 1',
              minPoints: 0,
            },
          ],
        },
      },
    });
  }

  findAll() {
    return this.prisma.forum.findMany({
      take: 10,
    });
  }

  async findAllClass(forumId: string) {
    return await this.classRepo.getAllClassesInForum(forumId);
  }

  findOne(id: number) {
    return `This action returns a #${id} forum`;
  }

  update(id: number, updateForumDto: UpdateForumDto) {
    return `This action updates a #${id} forum`;
  }

  remove(id: number) {
    return `This action removes a #${id} forum`;
  }
}
