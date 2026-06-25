import { Injectable, Logger } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivitiesRepository } from 'src/core/common/activities.repository';
import { PrismaService } from 'src/infra/database/prisma.service';

@Injectable()
export class ActivitiesService {
  private logger = new Logger(ActivitiesService.name);
  constructor(
    private readonly activitiesRepository: ActivitiesRepository,
    private readonly prisma: PrismaService,
  ) {}
  create(createActivityDto: CreateActivityDto) {
    return 'This action adds a new activity';
  }

  async findAll() {
    return await this.activitiesRepository.findAllActivities();
  }

  async findOne(id: string) {
    const activity = await this.activitiesRepository.findOneActivity(id);
    if (activity?.type == 'IMAGE_CHOICE' && activity?.multiChoice) {
      const transformedOptions = activity.multiChoice.questions.map(
        (question) => {
          return {
            ...question,
            options: question.options.map((option) => ({
              ...option,
              imageUrl: option.asset?.key
                ? `${process.env.S3_PUBLIC_URL!}/${option.asset.key}`
                : null,
            })),
          };
        },
      );

      return {
        data: {
          title: activity.title,
          lessonId: activity.lessonId,
          type: activity.type,
          order: activity.order,
          xpReward: activity.xpReward,
          multiChoice: {
            ...activity.multiChoice,
            options: transformedOptions,
          },
        },
      };
    }
    if (activity?.type == 'STORY') {
      return { data: activity };
    }
    return { data: {} };
  }

  update(id: number, updateActivityDto: UpdateActivityDto) {
    return `This action updates a #${id} activity`;
  }

  remove(id: number) {
    return `This action removes a #${id} activity`;
  }
}
