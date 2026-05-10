/*
  Warnings:

  - You are about to drop the column `languageId` on the `Module` table. All the data in the column will be lost.
  - Added the required column `forumId` to the `Lesson` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Module` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_languageId_fkey";

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "forumId" TEXT NOT NULL,
ALTER COLUMN "moduleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Module" DROP COLUMN "languageId",
ADD COLUMN     "targetLanguageId" INTEGER,
ADD COLUMN     "value" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_targetLanguageId_fkey" FOREIGN KEY ("targetLanguageId") REFERENCES "TargetLanguage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_forumId_fkey" FOREIGN KEY ("forumId") REFERENCES "Forum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
