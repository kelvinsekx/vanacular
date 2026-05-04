import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { LanguageRepository } from 'src/core/common/language.repository';

@Injectable()
export class LanguagesService {
  private readonly logger = new Logger(LanguagesService.name);
  cacheLangKey = 'languages:all';
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly langRepo: LanguageRepository,
  ) {}

  async getLanguages() {
    const cachedLanguages = await this.redis.get(this.cacheLangKey);

    if (cachedLanguages) {
      this.logger.debug('Cache HIT - Returning languages from Redis');
      return cachedLanguages;
    }

    this.logger.debug('Cache MISS - Fetch from database');

    const languages = await this.langRepo.findAllLanguages();
    await this.redis.set(this.cacheLangKey, JSON.stringify(languages));

    return languages;
  }

  async createLanguage(data: { name: string; identityExpression: string }) {
    const newLanguage = await this.langRepo.createLanguage(data);

    await this.redis.del(this.cacheLangKey);
    this.logger.debug('CACHE INVALIDATED: after language creation');

    return newLanguage;
  }

  async updateLanguage(
    id: number,
    data: { name: string; identityExpression: string },
  ) {
    const updatedLanguage = await this.langRepo.updateLanguage(id, data);

    await this.redis.del(this.cacheLangKey);
    this.logger.debug('CACHE INVALIDATED: after language update');

    return updatedLanguage;
  }
}
