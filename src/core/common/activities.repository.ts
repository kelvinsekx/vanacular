import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma.service';

@Injectable()
export class ActivitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActivities() {
    return await this.prisma.activity.findMany();
  }

  async findOneActivity(activityID: string) {
    return await this.prisma.activity.findFirst({
      where: {
        id: activityID,
      },
      include: {
        multiChoice: {
          include: {
            questions: {
              include: {
                options: {
                  include: {
                    asset: true,
                  },
                },
              },
            },
          },
        },
        story: {
          include: {
            pages: true,
          },
        },
        radio: true,
      },
    });
  }
}
