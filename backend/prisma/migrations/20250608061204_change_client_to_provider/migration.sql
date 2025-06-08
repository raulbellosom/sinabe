/*
  Warnings:

  - You are about to drop the column `client` on the `Project` table. All the data in the column will be lost.
  - Added the required column `provider` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Project` DROP COLUMN `client`,
    ADD COLUMN `provider` VARCHAR(191) NOT NULL;
