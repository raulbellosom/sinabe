/*
  Warnings:

  - You are about to drop the column `brand` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `model` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `typeId` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Vehicle` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.
  - You are about to drop the column `typeName` on the `VehicleType` table. All the data in the column will be lost.
  - Added the required column `enabled` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modelId` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enabled` to the `VehicleType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `VehicleType` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Vehicle` DROP FOREIGN KEY `Vehicle_typeId_fkey`;

-- AlterTable
ALTER TABLE `Vehicle` DROP COLUMN `brand`,
    DROP COLUMN `model`,
    DROP COLUMN `typeId`,
    ADD COLUMN `comments` VARCHAR(191) NULL,
    ADD COLUMN `enabled` BOOLEAN NOT NULL,
    ADD COLUMN `modelId` INTEGER NOT NULL,
    MODIFY `status` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `VehicleType` DROP COLUMN `typeName`,
    ADD COLUMN `enabled` BOOLEAN NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `VehicleBrand` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Model` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `year` INTEGER NOT NULL,
    `typeId` INTEGER NOT NULL,
    `brandId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Condition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VehicleCondition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `vehicleId` VARCHAR(191) NOT NULL,
    `conditionId` INTEGER NOT NULL,

    UNIQUE INDEX `VehicleCondition_vehicleId_conditionId_key`(`vehicleId`, `conditionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_modelId_fkey` FOREIGN KEY (`modelId`) REFERENCES `Model`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Model` ADD CONSTRAINT `Model_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `VehicleType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Model` ADD CONSTRAINT `Model_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `VehicleBrand`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VehicleCondition` ADD CONSTRAINT `VehicleCondition_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VehicleCondition` ADD CONSTRAINT `VehicleCondition_conditionId_fkey` FOREIGN KEY (`conditionId`) REFERENCES `Condition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
