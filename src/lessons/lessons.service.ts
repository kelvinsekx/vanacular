import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { PrismaService } from 'src/prisma.service';
import { type Lesson, type Activity } from 'src/generated/prisma/client';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(classId: string, createLessonDto: CreateLessonDto) {
    return await this.prisma.lesson.create({
      data: {
        title: createLessonDto.title,
        order: createLessonDto.order,
        lessonClassId: classId,
      },
    });
  }

  async findAll(forumId: string) {
    return await this.prisma.lesson.findMany({
      where: {
        lessonClass: {
          forumId,
        },
      },
      select: {
        id: true,
        title: true,
        order: true,
        lessonClass: {
          include: {
            forum: {
              select: {
                name: true,
              },
            },
          },
        },
        activities: {
          include: {
            multiChoice: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        lessonClass: {
          include: {
            forum: {
              select: {
                id: true,
                name: true,
                classes: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        activities: {
          orderBy: {
            order: 'asc',
          },
          include: {
            multiChoice: true,
            story: true,
            radio: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException({ message: 'Lesson not found' });
    }

    return lesson;
  }

  async updateLesson(lessonId: string, dto: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException({ message: 'Lesson not found' });
    }

    return await this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: dto.title,
        order: dto.order,
      },
      select: {
        id: true,
        title: true,
      },
    });
  }

  async findAllActivitiesInLesson(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        order: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException({ message: 'Lesson not found' });
    }

    const activities = await this.prisma.activity.findMany({
      where: { lessonId },
      orderBy: { order: 'asc' },
      include: {
        multiChoice: {
          include: {
            options: {
              orderBy: { position: 'asc' },
            },
            hints: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return {
      lesson,
      activities,
      totalActivities: activities.length,
    };
  }

  async getNextActivityForUser({
    userId,
    classId,
  }: {
    userId: string;
    classId: string;
  }) {
    //  First, get all lessons for the user's class, ordered by lesson.order
    //  Get userscompletedActivities

    const lessons = await this.prisma.lesson.findMany({
      where: {
        lessonClassId: classId,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        activities: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!lessons.length) {
      throw new NotFoundException({
        message: 'No lessons found for this class',
      });
    }

    // Get user's completed activities
    const completedActivities = await this.prisma.userActivityProgress.findMany(
      {
        where: {
          userId,
          status: 'COMPLETED',
        },
        select: {
          activityId: true,
        },
      },
    );

    const completedActivityIds = new Set(
      completedActivities.map((ca) => ca.activityId),
    );

    // Track which lessons are fully completed
    let currentLesson: any | null = null;
    let currentActivity: Activity | null = null;
    let completedActivitiesInLesson = 0;

    for (const lesson of lessons) {
      //     // Check if all activities in this lesson are completed
      const allActivitiesInLesson = lesson.activities.length;
      completedActivitiesInLesson = lesson.activities.filter((activity) =>
        completedActivityIds.has(activity.id),
      ).length;

      const isLessonCompleted =
        allActivitiesInLesson > 0 &&
        completedActivitiesInLesson === allActivitiesInLesson;

      if (!isLessonCompleted) {
        // This is the current lesson user is working on
        currentLesson = lesson;

        // Find the first incomplete activity in this lesson
        for (const activity of lesson.activities) {
          if (!completedActivityIds.has(activity.id)) {
            currentActivity = activity;
            break;
          }
        }
        break;
      }
    }

    //   // If all lessons are completed
    if (!currentLesson) {
      return {
        message:
          'Congratulations! You have completed all lessons in this class',
        allLessonsCompleted: true,
        nextActivity: null,
      };
    }

    //   // If no incomplete activity found in the current lesson (shouldn't happen, but just in case)
    if (!currentActivity) {
      return {
        message: 'No pending activities found in the current lesson',
        currentLesson: {
          id: currentLesson.id,
          title: currentLesson.title,
          order: currentLesson.order,
        },
        nextActivity: null,
        allActivitiesCompleted: true,
      };
    }

    // Get progress statistics
    const totalActivities = lessons.reduce(
      (sum, lesson) => sum + lesson.activities.length,
      0,
    );
    const completedCount = completedActivityIds.size;

    return {
      nextActivity: {
        id: currentActivity.id,
        type: currentActivity.type,
        order: currentActivity.order,
        locked: false,
        title: currentActivity.title,
        lesson: {
          id: currentLesson.id,
          title: currentLesson.title,
          order: currentLesson.order,
        },
      },
      progress: {
        completedActivities: completedCount,
        totalActivities: totalActivities,
        currentLesson: {
          id: currentLesson.id,
          title: currentLesson.title,
          completedActivities: completedActivitiesInLesson,
          totalActivitiesInLesson: currentLesson.activities.length,
        },
        percentageComplete: Math.round(
          (completedCount / totalActivities) * 100,
        ),
      },
    };
  }

  async markActivityAsCompleted(userId: string, activityId: string) {
    // Verify activity exists
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException({ message: 'Activity not found' });
    }

    // Check if already completed
    const existingProgress = await this.prisma.userActivityProgress.findUnique({
      where: {
        userId_activityId: {
          userId,
          activityId,
        },
      },
    });

    if (existingProgress && existingProgress.status == 'COMPLETED') {
      return {
        message: 'Activity already marked as completed',
        completed: true,
      };
    }

    // Create or update progress
    const progress = await this.prisma.userActivityProgress.upsert({
      where: {
        userId_activityId: {
          userId,
          activityId,
        },
      },
      update: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      create: {
        userId,
        activityId,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // After marking as completed, you might want to check if the lesson is now complete
    const lessonActivities = await this.prisma.activity.findMany({
      where: { lessonId: activity.lessonId },
      select: { id: true },
    });

    const completedInLesson = await this.prisma.userActivityProgress.count({
      where: {
        userId,
        activityId: { in: lessonActivities.map((a) => a.id) },
        status: 'COMPLETED',
      },
    });

    const isLessonComplete = completedInLesson === lessonActivities.length;

    return {
      message: 'Activity marked as completed',
      completed: true,
      isLessonComplete,
      lessonId: activity.lessonId,
    };
  }

  remove(id: number) {
    return `This action removes a #${id} lesson`;
  }
}
