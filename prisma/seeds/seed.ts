import {
  seedLanguages,
  seedAdmin,
  seedForumWithAtLeastOneClass,
} from './development/languages';
import {
  seedLessonsAndActivities,
  clearClassLessons,
} from './development/class-n-lessons';

import 'dotenv/config';
import { prisma } from './prismaClient';

const allowedEnvironments = ['development', 'test'];

async function main() {
  console.log('Start seeding...');

  const seededLangs = await seedLanguages();
  console.log('✅ successfully seeded languages');
  await seedAdmin(seededLangs[0].id);
  console.log('✅ successfully seeded admins');
  await seedForumWithAtLeastOneClass(seededLangs);
  console.log('✅ successfully seeded forums');
  await seedLessonsAndActivities();

  console.log(`Seeding finished`);
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
