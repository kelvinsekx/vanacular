/*
  Warnings:

  - You are about to drop the column `assetId` on the `MultipleChoiceOption` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MultipleChoiceOption" DROP CONSTRAINT "MultipleChoiceOption_assetId_fkey";

-- AlterTable
ALTER TABLE "MultipleChoiceOption" DROP COLUMN "assetId",
ADD COLUMN     "assetName" TEXT;

-- AddForeignKey
ALTER TABLE "MultipleChoiceOption" ADD CONSTRAINT "MultipleChoiceOption_assetName_fkey" FOREIGN KEY ("assetName") REFERENCES "Asset"("name") ON DELETE SET NULL ON UPDATE CASCADE;
