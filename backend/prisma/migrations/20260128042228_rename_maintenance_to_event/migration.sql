/*
  Warnings:

  - You are about to drop the `MaintenanceEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `MaintenanceEvent` DROP FOREIGN KEY `MaintenanceEvent_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `MaintenanceEvent` DROP FOREIGN KEY `MaintenanceEvent_verticalId_fkey`;

-- DropTable
DROP TABLE `MaintenanceEvent`;

-- CreateTable
CREATE TABLE `Event` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `scheduledDate` DATETIME(3) NOT NULL,
    `completedDate` DATETIME(3) NULL,
    `status` ENUM('SCHEDULED', 'COMPLETED', 'POSTPONED', 'CANCELLED', 'OVERDUE') NOT NULL DEFAULT 'SCHEDULED',
    `provider` VARCHAR(191) NULL,
    `type` ENUM('MAINTENANCE', 'GENERAL') NOT NULL DEFAULT 'MAINTENANCE',
    `scope` ENUM('GLOBAL', 'SPECIFIC') NOT NULL DEFAULT 'GLOBAL',
    `verticalId` INTEGER NULL,
    `isRecurring` BOOLEAN NOT NULL DEFAULT false,
    `recurrence` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,

    INDEX `Event_verticalId_idx`(`verticalId`),
    INDEX `Event_scheduledDate_idx`(`scheduledDate`),
    INDEX `Event_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventAttendee` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `EventAttendee_eventId_idx`(`eventId`),
    INDEX `EventAttendee_userId_idx`(`userId`),
    UNIQUE INDEX `EventAttendee_eventId_userId_key`(`eventId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_verticalId_fkey` FOREIGN KEY (`verticalId`) REFERENCES `Vertical`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventAttendee` ADD CONSTRAINT `EventAttendee_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventAttendee` ADD CONSTRAINT `EventAttendee_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
