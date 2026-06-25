/*
  Warnings:

  - You are about to drop the column `activityId` on the `Hint` table. All the data in the column will be lost.
  - You are about to drop the column `explanation` on the `MultiChoiceActivity` table. All the data in the column will be lost.
  - You are about to drop the column `prompt` on the `MultiChoiceActivity` table. All the data in the column will be lost.
  - You are about to drop the column `activityId` on the `MultipleChoiceOption` table. All the data in the column will be lost.
  - Added the required column `questionId` to the `Hint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionId` to the `MultipleChoiceOption` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Hint" DROP CONSTRAINT "Hint_activityId_fkey";

-- DropForeignKey
ALTER TABLE "MultipleChoiceOption" DROP CONSTRAINT "MultipleChoiceOption_activityId_fkey";

-- AlterTable
ALTER TABLE "Hint" DROP COLUMN "activityId",
ADD COLUMN     "questionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MultiChoiceActivity" DROP COLUMN "explanation",
DROP COLUMN "prompt";

-- AlterTable
ALTER TABLE "MultipleChoiceOption" DROP COLUMN "activityId",
ADD COLUMN     "questionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MultiChoiceActivityQuestion" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "explanation" TEXT,
    "assetId" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "multiChoiceActivityId" TEXT NOT NULL,

    CONSTRAINT "MultiChoiceActivityQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MultiChoiceActivityQuestion" ADD CONSTRAINT "MultiChoiceActivityQuestion_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultiChoiceActivityQuestion" ADD CONSTRAINT "MultiChoiceActivityQuestion_multiChoiceActivityId_fkey" FOREIGN KEY ("multiChoiceActivityId") REFERENCES "MultiChoiceActivity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MultipleChoiceOption" ADD CONSTRAINT "MultipleChoiceOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "MultiChoiceActivityQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hint" ADD CONSTRAINT "Hint_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "MultiChoiceActivityQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
