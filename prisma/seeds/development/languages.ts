import { PrismaClient } from './../../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Language = {
  id: number;
  name: string;
  identityExpression: string;
};

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

  const result: Array<Language> = [];

  for (let index = 0; index < languages.length; index++) {
    const existingR = await prisma.targetLanguage.upsert({
      where: { name: languages[index].name },
      update: {},
      create: languages[index],
    });
    result[index] = existingR;
  }
  return result;
}

export async function seedForumWithAtLeastOneClass(languages: Array<Language>) {
  for (const lang of languages) {
    await prisma.forum.upsert({
      where: { name: lang.name },
      update: {},
      create: {
        name: lang.name,
        languageId: lang.id,
        classes: {
          create: [
            {
              level: 1,
              name: 'Basic 1',
              minPoints: 0,
            },
            {
              level: 2,
              name: 'Basic 2',
              minPoints: 50,
            },
          ],
        },
      },
    });
  }
}
export async function seedAdmin(targetLanguageId: number) {
  const ADMIN_USER = {
    email: process.env.ADMIN_EMAIL as string,
    password: process.env.ADMIN_PASSWORD as string,
    targetLanguageId,
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
