/*
  Warnings:

  - Made the column `title` on table `Activity` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "title" SET NOT NULL;
