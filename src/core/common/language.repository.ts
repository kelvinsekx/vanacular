import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infra/database/prisma.service';

@Injectable()
export class LanguageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async exists(id: number): Promise<boolean> {
    const count = await this.prisma.targetLanguage.count({
      where: { id },
    });
    return count > 0;
  }

  async findAllLanguages() {
    return await this.prisma.targetLanguage.findMany();
  }

  async createLanguage(data: Prisma.TargetLanguageCreateInput) {
    return await this.prisma.targetLanguage.create({ data });
  }

  async updateLanguage(id: number, data: Prisma.TargetLanguageCreateInput) {
    return await this.prisma.targetLanguage.update({ where: { id }, data });
  }
}
