/*
  Warnings:

  - You are about to drop the column `assetId` on the `MultiChoiceActivityQuestion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MultiChoiceActivityQuestion" DROP CONSTRAINT "MultiChoiceActivityQuestion_assetId_fkey";

-- AlterTable
ALTER TABLE "MultiChoiceActivityQuestion" DROP COLUMN "assetId",
ADD COLUMN     "assetName" TEXT;

-- AddForeignKey
ALTER TABLE "MultiChoiceActivityQuestion" ADD CONSTRAINT "MultiChoiceActivityQuestion_assetName_fkey" FOREIGN KEY ("assetName") REFERENCES "Asset"("name") ON DELETE SET NULL ON UPDATE CASCADE;
