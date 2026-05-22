/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `MultipleChoiceOption` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `StoryPage` table. All the data in the column will be lost.
  - Added the required column `assetId` to the `StoryPage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MultipleChoiceOption" DROP COLUMN "imageUrl",
ADD COLUMN     "assetId" TEXT;

-- AlterTable
ALTER TABLE "StoryPage" DROP COLUMN "imageUrl",
ADD COLUMN     "assetId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "MultipleChoiceOption" ADD CONSTRAINT "MultipleChoiceOption_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryPage" ADD CONSTRAINT "StoryPage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
