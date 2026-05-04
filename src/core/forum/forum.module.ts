import { Module } from '@nestjs/common';
import { ForumService } from './forum.service';
import { LanguageRepository } from '../common/language.repository';
import { ForumController } from './forum.controller';

@Module({
  controllers: [ForumController],
  providers: [ForumService, LanguageRepository],
})
export class ForumModule {}
