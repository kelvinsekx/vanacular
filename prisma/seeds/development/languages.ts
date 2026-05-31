import { PrismaClient } from './../../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export async function seedLanguages() {
  const languages = [
    {
      name: 'Yoruba',
      identityExpression: 'Omo Yoruba',
    },
    {
      name: 'Itsekiri',
      identityExpression: 'Itsekiri wadoo',
    },
    {
      name: 'Hausa',
      identityExpression: 'Barkan ku',
    },
    {
      name: 'Igala',
      identityExpression: 'Igala Awaa',
    },
    {
      name: 'Igbo',
      identityExpression: 'Kwenu',
    },
    {
      name: 'Idoma',
      identityExpression: 'Ache Idoma',
    },
  ];

  for (const language of languages) {
    await prisma.targetLanguage.upsert({
      where: { name: language.name },
      update: {},
      create: language,
    });
  }
}

export async function seedAdmin() {
  const ADMIN_USER = {
    email: process.env.ADMIN_EMAIL as string,
    password: process.env.ADMIN_PASSWORD as string,
    targetLanguageId: 2,
  };

  await prisma.user.upsert({
    where: {
      email: ADMIN_USER.email,
    },
    update: {
      password: await bcrypt.hash(
        ADMIN_USER.password,
        Number(process.env.AUTH_SALT),
      ),
    },
    create: {
      email: ADMIN_USER.email,
      password: await bcrypt.hash(
        ADMIN_USER.password,
        Number(process.env.AUTH_SALT),
      ),
      targetLanguageId: ADMIN_USER.targetLanguageId,
      role: 'ADMIN',
    },
  });
}
