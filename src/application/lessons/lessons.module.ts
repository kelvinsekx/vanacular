import { Module } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { LessonsMultiTypeService } from './lessons-multi.service';

@Module({
  controllers: [LessonsController],
  providers: [LessonsService, LessonsMultiTypeService],
})
export class LessonsModule {}
