-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aiSuggestionsResetDate" TIMESTAMP(3),
ADD COLUMN     "aiSuggestionsUsed" INTEGER NOT NULL DEFAULT 0;
