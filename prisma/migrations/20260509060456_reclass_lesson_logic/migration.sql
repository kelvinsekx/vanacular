/*
  Warnings:

  - You are about to drop the column `forumId` on the `Lesson` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_forumId_fkey";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "forumId",
ADD COLUMN     "lessonClassId" TEXT NOT NULL DEFAULT '7d98c187-ba47-49fe-9ec0-dca9189f3b90';

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_lessonClassId_fkey" FOREIGN KEY ("lessonClassId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
