import { PrismaClient } from './../../src/generated/prisma/client';
import { seedLanguages, seedAdmin } from './development/languages';
import { PrismaPg } from '@prisma/adapter-pg';

import 'dotenv/config';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log('Start seeding...');

  await seedLanguages();
  await seedAdmin();

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
