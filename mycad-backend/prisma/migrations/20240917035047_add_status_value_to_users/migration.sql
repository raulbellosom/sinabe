/*
  Warnings:

  - You are about to drop the column `large` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `medium` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `large` on the `UserImage` table. All the data in the column will be lost.
  - You are about to drop the column `medium` on the `UserImage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Image` DROP COLUMN `large`,
    DROP COLUMN `medium`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `status` BOOLEAN NULL;

-- AlterTable
ALTER TABLE `UserImage` DROP COLUMN `large`,
    DROP COLUMN `medium`;
