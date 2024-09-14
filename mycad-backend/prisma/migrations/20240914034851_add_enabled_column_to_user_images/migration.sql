/*
  Warnings:

  - Added the required column `enabled` to the `UserImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UserImage` ADD COLUMN `enabled` BOOLEAN NOT NULL;
