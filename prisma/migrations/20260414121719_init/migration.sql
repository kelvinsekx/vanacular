-- CreateEnum
CREATE TYPE "LearningObjective" AS ENUM ('CASUAL', 'PROFESSIONAL', 'TRAVEL', 'EXAM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "targetLanguageId" INTEGER,
    "password" TEXT NOT NULL,
    "bio" VARCHAR(160),
    "avatarUrl" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "learningObjective" "LearningObjective" NOT NULL DEFAULT 'CASUAL',
    "nativeLanguage" TEXT,
    "dailyXpGoal" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TargetLanguage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TargetLanguage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "TargetLanguage_name_key" ON "TargetLanguage"("name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_targetLanguageId_fkey" FOREIGN KEY ("targetLanguageId") REFERENCES "TargetLanguage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
