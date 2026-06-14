import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Req,
  Delete,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import {
  CreateLessonDto,
  CreateMultiChoiceActivityDto,
  UpdateMultiActivityDto,
  UpdateOptionParamsDto,
} from './dto/create-lesson.dto';
import { UpdateLessonDto, UpdateOptionDto } from './dto/update-lesson.dto';
import { ForumAccessGuard, type ForumRequest } from './lessons.guard';
import { LessonsMultiTypeService } from './lessons-multi.service';

@Controller('lessons')
export class LessonsController {
  constructor(
    private readonly lessonsService: LessonsService,
    private readonly lessonMultiType: LessonsMultiTypeService,
  ) {}

  @UseGuards(ForumAccessGuard)
  @Post()
  create(@Body() createLessonDto: CreateLessonDto, @Req() req: ForumRequest) {
    return this.lessonsService.create(req.forum.id, createLessonDto);
  }

  @Post('/:lessonId/multi-choice')
  createMultiChoiceActivity(
    @Body() createMultiChoiceActivityDto: CreateMultiChoiceActivityDto,
    @Param('lessonId') lessonId: string,
  ) {
    return this.lessonMultiType.createLessonActivity(
      lessonId,
      createMultiChoiceActivityDto,
    );
  }

  @Get('/:id/activites')
  findAllLessonActivities() {
    return 'I will return all activites for a lesson';
  }

  @Patch('/activities/:activityId/multi-choice')
  updateMultiChoiceActivity(
    @Body() updateMultiChoiceActivityDto: UpdateMultiActivityDto,
    @Param('activityId') activityId: string,
  ) {
    return this.lessonMultiType.updateLessonActivityForMultiChoice(
      activityId,
      updateMultiChoiceActivityDto,
    );
  }

  @Patch('/options/:optionId/multi-choice')
  updateMultiChoiceOption(
    @Body() updateMultiChoiceOptionDto: UpdateOptionDto,
    @Param() params: UpdateOptionParamsDto,
  ) {
    return this.lessonMultiType.updateOption(
      +params.optionId,
      updateMultiChoiceOptionDto,
    );
  }

  @UseGuards(ForumAccessGuard)
  @Get()
  findAll(@Req() req: ForumRequest) {
    return this.lessonsService.findAll(req.forum.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: ForumRequest) {
    return this.lessonsService.findOne(req.forum.id);
  }

  @Patch(':lessonId')
  update(
    @Param('lessonId') lessonId: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.updateLesson(lessonId, updateLessonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lessonsService.remove(+id);
  }
}
