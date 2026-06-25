/*
  Warnings:

  - You are about to drop the column `assetId` on the `StoryPage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "StoryPage" DROP CONSTRAINT "StoryPage_assetId_fkey";

-- AlterTable
ALTER TABLE "StoryPage" DROP COLUMN "assetId",
ADD COLUMN     "assetName" TEXT;
