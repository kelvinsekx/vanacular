/*
  Warnings:

  - You are about to drop the column `moduleId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `xpReward` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the `LessonContent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Module` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('MULTI_CHOICE', 'IMAGE_CHOICE', 'STORY', 'RADIO');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "LessonContent" DROP CONSTRAINT "LessonContent_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_targetLanguageId_fkey";

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "moduleId",
DROP COLUMN "xpReward";

-- DropTable
DROP TABLE "LessonContent";

-- DropTable
DROP TABLE "Module";

-- DropEnum
DROP TYPE "ContentType";

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "order" INTEGER NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "difficulty" "Difficulty",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MultiChoiceActivity" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "explanation" TEXT,
    "shuffle" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MultiChoiceActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MultipleChoiceOption" (
    "id" SERIAL NOT NULL,
    "activityId" TEXT NOT NULL,
    "text" TEXT,
    "imageUrl" TEXT,
    "alt" TEXT,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER,

    CONSTRAINT "MultipleChoiceOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryActivity" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "StoryActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoryPage" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "StoryPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadioChoiceActivity" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "transcript" TEXT,

    CONSTRAINT "RadioChoiceActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hint" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MultiChoiceActivity_activityId_key" ON "MultiChoiceActivity"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryActivity_activityId_key" ON "StoryActivity"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "RadioChoiceActivity_activityId_key" ON "RadioChoiceActivity"("activityId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiChoiceActivity" ADD CONSTRAINT "MultiChoiceActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultipleChoiceOption" ADD CONSTRAINT "MultipleChoiceOption_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "MultiChoiceActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryActivity" ADD CONSTRAINT "StoryActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryPage" ADD CONSTRAINT "StoryPage_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "StoryActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadioChoiceActivity" ADD CONSTRAINT "RadioChoiceActivity_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hint" ADD CONSTRAINT "Hint_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "MultiChoiceActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
