/*
  Warnings:

  - You are about to drop the column `userId` on the `note` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Note_userId_idx` ON `Note`;

-- AlterTable
ALTER TABLE `Note` RENAME COLUMN `userId` TO `authorId`;

-- CreateIndex
CREATE INDEX `Note_authorId_idx` ON `Note`(`authorId`);
