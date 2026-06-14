import { Module } from '@nestjs/common';
import { ForumService } from './forum.service';
import { ForumController } from './forum.controller';
import { LanguageRepository } from 'src/core/common/language.repository';
import { ClassRepository } from 'src/core/common/classes.repository';

@Module({
  controllers: [ForumController],
  providers: [ForumService, LanguageRepository, ClassRepository],
})
export class ForumModule {}
