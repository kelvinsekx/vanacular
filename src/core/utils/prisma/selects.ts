import { Prisma } from 'src/generated/prisma/client';

export const classSelect = {
  id: true,
  name: true,
  level: true,
  minPoints: true,
  forum: {
    select: {
      name: true,
      id: true,
    },
  },
} satisfies Prisma.ClassSelect;

export const FetchMessageSelect = {
  id: true,
  content: true,
  author: {
    select: {
      username: true,
      id: true,
    },
  },
  responses: {
    select: {
      id: true,
      voteCount: true,
      content: true,
    },
  },
  createdAt: true,
} as Prisma.ChatSelect;
