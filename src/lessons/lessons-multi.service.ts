import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateMultiChoiceActivityDto,
  UpdateMultiActivityDto,
  UpdateOptionParamsDto,
} from './dto/create-lesson.dto';
import { UpdateLessonDto, UpdateOptionDto } from './dto/update-lesson.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class LessonsMultiTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async createLessonActivity(
    lessonId: string,
    dto: CreateMultiChoiceActivityDto,
  ) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId },
    });
    if (!lesson)
      throw new NotFoundException({ message: 'This lesson can not be found' });

    const correctAnswers = dto.options.filter((option) => option.isCorrect);
    if (correctAnswers.length !== 1)
      throw new BadRequestException({
        message:
          'Multiple choice activity must have exactly one correct option',
      });

    if (dto.options.length < 2)
      throw new BadRequestException({
        message: 'At least 2 options are required',
      });
    return await this.prisma.activity.create({
      data: {
        lessonId,
        type: dto.type,
        order: dto.order,
        multiChoice: {
          create: {
            prompt: dto.prompt,
            options: {
              create: dto.options.map((option, index) => ({
                text: option.text,
                imageUrl: option.imageUrl,
                isCorrect: option.isCorrect,
                position: index,
              })),
            },
            hints: dto.hints?.length
              ? {
                  create: dto.hints.map((hint) => ({
                    text: hint.text,
                    order: hint.order,
                  })),
                }
              : undefined,
          },
        },
      },
      include: {
        multiChoice: {
          include: {
            options: true,
            hints: true,
          },
        },
      },
    });
  }

  async updateLessonActivityForMultiChoice(
    activityId: string,
    dto: UpdateMultiActivityDto = {},
  ) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException({ message: 'Activity not found' });
    }

    return await this.prisma.activity.update({
      where: { id: activityId },
      data: {
        order: dto.order,
        type: dto.type,
        multiChoice: {
          update: {
            prompt: dto.prompt,
          },
        },
      },
      include: {
        multiChoice: {
          include: {
            options: true,
            hints: true,
          },
        },
      },
    });
  }

  async updateOption(optionId: number, updateOptionDto: UpdateOptionDto) {
    const option = await this.prisma.multipleChoiceOption.findUnique({
      where: { id: optionId },
      include: {
        activity: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!option) {
      throw new NotFoundException({ message: 'Option not found' });
    }

    // If this option is being marked as correct, ensure no other option in the same activity is correct
    if (updateOptionDto.isCorrect === true) {
      const activityOptions = option.activity.options;
      const hasOtherCorrect = activityOptions.some(
        (opt) => opt.id !== optionId && opt.isCorrect === true,
      );

      if (hasOtherCorrect) {
        // Set all other options to incorrect
        await this.prisma.multipleChoiceOption.updateMany({
          where: {
            activityId: option.activityId,
            id: { not: optionId },
          },
          data: {
            isCorrect: false,
          },
        });
      }
    }

    return await this.prisma.multipleChoiceOption.update({
      where: { id: optionId },
      data: {
        text: updateOptionDto.text,
        imageUrl: updateOptionDto.imageUrl,
        isCorrect: updateOptionDto.isCorrect,
        position: updateOptionDto.position,
        alt: updateOptionDto.alt,
      },
    });
  }
}
