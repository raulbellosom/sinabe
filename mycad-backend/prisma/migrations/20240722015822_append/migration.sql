-- AlterTable
ALTER TABLE `Vehicle` ADD COLUMN `economicNumber` VARCHAR(191) NULL,
    ADD COLUMN `plateNumber` VARCHAR(191) NULL,
    ADD COLUMN `serialNumber` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Image` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `thumbnail` VARCHAR(191) NULL,
    `medium` VARCHAR(191) NULL,
    `large` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `enabled` BOOLEAN NOT NULL,
    `vehicleId` VARCHAR(191) NULL,

    INDEX `Image_vehicleId_idx`(`vehicleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
