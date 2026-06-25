import { clearClassLessons } from './development/class-n-lessons';

import 'dotenv/config';
import { prisma } from './prismaClient';

const allowedEnvironments = ['development', 'test'];

async function main() {
  console.log('clearing seeding...');

  if (allowedEnvironments.includes(process.env.NODE_ENV ?? '')) {
    await clearClassLessons();
  }

  console.log(`clearing finished`);
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
