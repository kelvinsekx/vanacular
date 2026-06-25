import { prisma } from '../prismaClient';
import { result as yorubaLessons } from './../contents/yoruba/yoruba.seed';

// ----------------------------- /
/**
 * {
 *    lesson,
 * }
 * yorubaLessons = [{}, {}]
 */
export async function seedLessonsAndActivities() {
  console.log('🌱 Starting seeding lessons...');

  for (const lessonSeed of yorubaLessons) {
    await seedLesson(lessonSeed);
  }

  console.log('✅ Seeding lessons completed');
}

async function seedLesson(lessonSeed: any) {
  const lesson = await prisma.lesson.create({
    data: {
      title: lessonSeed.title,
    },
  });

  for (const activitySeed of lessonSeed.activities) {
    await seedActivity(lesson.id, activitySeed);
  }
}

async function seedActivity(lessonId: string, activitySeed: any) {
  const activity = await prisma.activity.create({
    data: {
      title: activitySeed.title,
      lessonId,
      type: activitySeed.type,
      order: activitySeed.order,
    },
  });

  switch (activitySeed.type) {
    case 'STORY':
      await seedStory(activity.id, activitySeed);
      break;

    case 'MULTI_CHOICE':
      await seedMultiChoice(activity.id, activitySeed);
      break;

    case 'IMAGE_CHOICE':
      await seedImageChoice(activity.id, activitySeed);
      break;
  }
}

async function seedStory(activityId: string, activitySeed: any) {
  const story = await prisma.storyActivity.create({
    data: {
      activityId,
      title: activitySeed.title,
    },
  });

  if (activitySeed.pages.length) {
    for (const page of activitySeed.pages) {
      await prisma.storyPage.create({
        data: {
          storyId: story.id,
          content: page.content,
          order: page.order,
          // assetId optional in your schema
          assetName: page.assetName ?? null,
        },
      });
    }
  }
}

// -----------------------------
// MULTI CHOICE SEEDER (NEW STRUCTURE)
// -----------------------------
async function seedMultiChoice(activityId: string, activitySeed: any) {
  const mcq = await prisma.multiChoiceActivity.create({
    data: {
      activityId,
      shuffle: true,
    },
  });

  //console.log({ activitySeed: JSON.stringify(activitySeed) });

  for (const q of activitySeed.questions) {
    const question = await prisma.multiChoiceActivityQuestion.create({
      data: {
        multiChoiceActivityId: mcq.id,
        prompt: q.prompt,
        explanation: q.explanation,
      },
    });
    // console.log(q.options);
    for (let i = 0; i < q.options.length; i++) {
      const opt = q.options[i];

      await prisma.multipleChoiceOption.create({
        data: {
          questionId: question.id,
          text: opt.text ?? null,
          isCorrect: !!opt.isCorrect,
          position: i,
        },
      });
    }
  }
}

// -----------------------------
// IMAGE CHOICE (same engine as MCQ)
// -----------------------------
async function seedImageChoice(activityId: string, activitySeed: any) {
  // You are NOT creating a new table — just MCQ with images
  const mcq = await prisma.multiChoiceActivity.create({
    data: {
      activityId,
      shuffle: true,
    },
  });

  for (const q of activitySeed.questions) {
    const question = await prisma.multiChoiceActivityQuestion.create({
      data: {
        multiChoiceActivityId: mcq.id,
        prompt: q.prompt,
        explanation: q.explanation,
      },
    });

    for (let i = 0; i < q.options.length; i++) {
      const opt = q.options[i];
      await prisma.multipleChoiceOption.create({
        data: {
          questionId: question.id,
          assetName: opt.asset, // image-based option
          isCorrect: !!opt.isCorrect,
          position: i,
        },
      });
    }
  }
}

export async function clearClassLessons() {
  await prisma.multipleChoiceOption.deleteMany();
  await prisma.multiChoiceActivityQuestion.deleteMany();
  await prisma.multiChoiceActivity.deleteMany();
  await prisma.storyPage.deleteMany();
  await prisma.storyActivity.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.lesson.deleteMany();
}
