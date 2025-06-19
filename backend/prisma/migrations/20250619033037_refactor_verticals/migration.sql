/*
  Warnings:

  - You are about to drop the `ProjectVertical` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProjectVerticalsOnProjects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_ProjectVerticalsOnProjects` DROP FOREIGN KEY `_ProjectVerticalsOnProjects_A_fkey`;

-- DropForeignKey
ALTER TABLE `_ProjectVerticalsOnProjects` DROP FOREIGN KEY `_ProjectVerticalsOnProjects_B_fkey`;

-- DropTable
DROP TABLE `ProjectVertical`;

-- DropTable
DROP TABLE `_ProjectVerticalsOnProjects`;

-- CreateTable
CREATE TABLE `Vertical` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Vertical_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModelVertical` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `modelId` INTEGER NOT NULL,
    `verticalId` INTEGER NOT NULL,

    INDEX `ModelVertical_modelId_idx`(`modelId`),
    INDEX `ModelVertical_verticalId_idx`(`verticalId`),
    UNIQUE INDEX `ModelVertical_modelId_verticalId_key`(`modelId`, `verticalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ModelVertical` ADD CONSTRAINT `ModelVertical_modelId_fkey` FOREIGN KEY (`modelId`) REFERENCES `Model`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModelVertical` ADD CONSTRAINT `ModelVertical_verticalId_fkey` FOREIGN KEY (`verticalId`) REFERENCES `Vertical`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
