import { Injectable } from '@nestjs/common';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivitiesRepository } from 'src/core/common/activities.repository';

@Injectable()
export class ActivitiesService {
  constructor(private readonly activitiesRepository: ActivitiesRepository) {}
  create(createActivityDto: CreateActivityDto) {
    return 'This action adds a new activity';
  }

  async findAll() {
    return await this.activitiesRepository.findAllActivities();
  }

  async findOne(id: string) {
    const lesson = await this.activitiesRepository.findOneActivity(id);
    if (lesson?.type == 'IMAGE_CHOICE' && lesson?.multiChoice) {
      const transformedOptions = lesson.multiChoice.options.map((option) => ({
        ...option,
        imageUrl: option.asset?.key
          ? `${process.env.S3_PUBLIC_URL!}/${option.asset.key}`
          : null,
      }));

      return {
        title: lesson.title,
        lessonId: lesson.lessonId,
        type: lesson.type,
        order: lesson.order,
        xpReward: lesson.xpReward,
        multiChoice: {
          ...lesson.multiChoice,
          options: transformedOptions,
        },
      };
    }
    return {};
  }

  update(id: number, updateActivityDto: UpdateActivityDto) {
    return `This action updates a #${id} activity`;
  }

  remove(id: number) {
    return `This action removes a #${id} activity`;
  }
}
