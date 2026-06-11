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
    const methodName = 'getLanguages';
    const startTime = Date.now();

    try {
      this.logger.log(
        `[${methodName}] - Starting language retrieval operation`,
      );

      const cachedLanguages = await this.redis.get(this.cacheLangKey);

      if (cachedLanguages) {
        const duration = Date.now() - startTime;
        this.logger.debug(
          `[${methodName}] - Cache HIT - Returning languages from Redis completed in ${duration}ms`,
        );
        return {
          data: JSON.parse(cachedLanguages) as Array<{
            id: number;
            name: string;
            identityExpression: string;
          }>,
        };
      }

      this.logger.debug(`[${methodName}] - Cache MISS - Fetch from database`);

      const languages = await this.langRepo.findAllLanguages();

      if (!languages || !Array.isArray(languages)) {
        this.logger.warn(
          `[${methodName}] - Database returned invalid languages data:`,
          { languages },
        );
        return { data: [] };
      }
      if (this.redis && languages.length > 0) {
        this.cacheLanguages(languages).catch((cacheErr) => {
          this.logger.error(
            `[${methodName}] - Non-blocking cache write failed`,
            {
              error: cacheErr as string,
              languageCount: languages.length,
            },
          );
        });
      } else if (languages.length === 0) {
        this.logger.warn(
          `[${methodName}] - Empty languages array received, skipping cache write`,
        );
      }

      return { data: languages };
    } catch (err) {
      console.log(err);
      this.logger.error(err);
      return { data: null };
    }
  }
  async findLanguage(id: number | null | undefined): Promise<{
    data: { id: number; name: string; identityExpression: string } | null;
  }> {
    const methodName = 'findLanguage';
    const startTime = Date.now();

    try {
      if (id === null || id === undefined) {
        this.logger.warn(
          `[${methodName}] - Invalid input: id is ${id === null ? 'null' : 'undefined'}`,
        );
        return { data: null };
      }

      if (typeof id !== 'number' || isNaN(id)) {
        this.logger.warn(
          `[${methodName}] - Invalid id type: expected number, got ${typeof id}`,
          { id },
        );
        return { data: null };
      }

      this.logger.debug(
        `[${methodName}] - Searching for language with id: ${id}`,
      );

      const { data: langs } = await this.getLanguages();

      if (!langs) {
        this.logger.warn(
          `[${methodName}] - getLanguages returned null data for id: ${id}`,
        );
        return { data: null };
      }

      if (!Array.isArray(langs)) {
        this.logger.error(
          `[${methodName}] - Invalid data structure from getLanguages: expected array, got ${typeof langs}`,
        );
        return { data: null };
      }

      if (langs.length === 0) {
        this.logger.debug(
          `[${methodName}] - Languages array is empty, cannot find id: ${id}`,
        );
        return { data: null };
      }

      this.logger.debug(
        `[${methodName}] - Searching through ${langs.length} languages`,
      );

      const lang = langs.find((lang) => {
        if (!lang || typeof lang.id !== 'number') {
          this.logger.warn(
            `[${methodName}] - Invalid language object encountered:`,
            { lang },
          );
          return false;
        }
        return lang.id === id;
      });

      const duration = Date.now() - startTime;

      if (lang) {
        this.logger.log(
          `[${methodName}] - Language found: id=${id}, name="${lang.name}" (took ${duration}ms)`,
        );
        return { data: lang };
      } else {
        this.logger.warn(
          `[${methodName}] - Language not found for id: ${id} (took ${duration}ms)`,
        );
        return { data: null };
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const errorStack = err instanceof Error ? err.stack : undefined;

      this.logger.error(
        `[${methodName}] - Unexpected error after ${duration}ms: ${errorMessage}`,
        {
          error: err as string,
          errorMessage,
          errorStack,
          requestedId: id,
        },
      );

      return { data: null };
    }
  }

  async clearCache() {
    await this.redis.del(this.cacheLangKey);

    return { success: true };
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

  private async cacheLanguages(languages: any[]): Promise<void> {
    const maxRetries = 3;
    const retryDelay = 100; // ms

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(
          `Cache write attempt ${attempt}/${maxRetries} for key: ${this.cacheLangKey}`,
        );

        const serialized = JSON.stringify(languages);
        const ttl = 3600; // Consider making this configurable

        await this.redis.setex(this.cacheLangKey, ttl, serialized);

        this.logger.log(
          `Successfully cached ${languages.length} languages with TTL ${ttl}s`,
        );
        return;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(
          `Cache write attempt ${attempt} failed: ${errorMessage}`,
          {
            attempt,
            error: err,
            cacheKey: this.cacheLangKey,
          },
        );

        if (attempt === maxRetries) {
          this.logger.error(
            `All ${maxRetries} cache write attempts failed for key: ${this.cacheLangKey}`,
          );
          throw err;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * attempt),
        );
      }
    }
  }
}
