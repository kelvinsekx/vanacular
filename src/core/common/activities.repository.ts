import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

type ActivityWithRelations = Prisma.ActivityGetPayload<{
  include: {
    multiChoice: {
      include: {
        options: {
          include: {
            asset: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class ActivitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActivities() {
    return await this.prisma.activity.findMany();
  }

  async findOneActivity(
    activityID: string,
  ): Promise<ActivityWithRelations | null> {
    return await this.prisma.activity.findFirst({
      where: {
        id: activityID,
      },
      include: {
        multiChoice: {
          include: {
            options: {
              include: {
                asset: true,
              },
            },
          },
        },
        story: true,
        radio: true,
      },
    });
  }
}
