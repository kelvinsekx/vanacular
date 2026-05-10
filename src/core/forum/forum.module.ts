import { Module } from '@nestjs/common';
import { ForumService } from './forum.service';
import { LanguageRepository } from '../common/language.repository';
import { ForumController } from './forum.controller';
import { ClassRepository } from '../common/classes.repository';

@Module({
  controllers: [ForumController],
  providers: [ForumService, LanguageRepository, ClassRepository],
})
export class ForumModule {}
