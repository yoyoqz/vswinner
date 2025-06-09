/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedById` on the `File` table. All the data in the column will be lost.
  - Added the required column `filePath` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_uploadedById_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "fileUrl",
DROP COLUMN "uploadedById",
ADD COLUMN     "filePath" TEXT NOT NULL,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;
