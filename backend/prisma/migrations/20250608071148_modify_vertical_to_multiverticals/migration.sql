/*
  Warnings:

  - You are about to drop the column `verticalId` on the `Project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Project` DROP FOREIGN KEY `Project_verticalId_fkey`;

-- DropIndex
DROP INDEX `Project_verticalId_fkey` ON `Project`;

-- AlterTable
ALTER TABLE `Project` DROP COLUMN `verticalId`;

-- CreateTable
CREATE TABLE `_ProjectVerticalsOnProjects` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ProjectVerticalsOnProjects_AB_unique`(`A`, `B`),
    INDEX `_ProjectVerticalsOnProjects_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ProjectVerticalsOnProjects` ADD CONSTRAINT `_ProjectVerticalsOnProjects_A_fkey` FOREIGN KEY (`A`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectVerticalsOnProjects` ADD CONSTRAINT `_ProjectVerticalsOnProjects_B_fkey` FOREIGN KEY (`B`) REFERENCES `ProjectVertical`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
