import { PartialType } from '@nestjs/mapped-types';
import { CreateLessonDto, MultipleChoiceOptionDto } from './create-lesson.dto';

export class UpdateLessonDto extends PartialType(CreateLessonDto) {}

export class UpdateOptionDto extends PartialType(MultipleChoiceOptionDto) {}
