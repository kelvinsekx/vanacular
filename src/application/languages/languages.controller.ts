import { Controller, Post, Get } from '@nestjs/common';
import { LanguagesService } from './languages.service';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languageService: LanguagesService) {}

  @Get()
  async getAll() {
    return this.languageService.getLanguages();
  }

  @Post('clear-cache')
  async clearCache() {
    return await this.languageService.clearCache();
  }
}
