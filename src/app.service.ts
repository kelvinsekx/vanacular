import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello() {
    return {
      message: 'Hello World!',
    };
  }

  async getListOfSupportedLanguages() {
    return await this.prisma.targetLanguage.findMany();
  }
}
