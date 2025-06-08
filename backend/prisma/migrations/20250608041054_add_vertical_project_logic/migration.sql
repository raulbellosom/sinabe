/*
  Warnings:

  - You are about to drop the column `vertical` on the `Project` table. All the data in the column will be lost.
  - Added the required column `verticalId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Project` DROP COLUMN `vertical`,
    ADD COLUMN `verticalId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `ProjectVertical` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ProjectVertical_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_verticalId_fkey` FOREIGN KEY (`verticalId`) REFERENCES `ProjectVertical`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
