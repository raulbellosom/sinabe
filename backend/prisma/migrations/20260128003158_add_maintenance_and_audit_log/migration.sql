-- CreateTable
CREATE TABLE `MaintenanceEvent` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `scheduledDate` DATETIME(3) NOT NULL,
    `completedDate` DATETIME(3) NULL,
    `status` ENUM('SCHEDULED', 'COMPLETED', 'POSTPONED', 'CANCELLED', 'OVERDUE') NOT NULL DEFAULT 'SCHEDULED',
    `provider` VARCHAR(191) NULL,
    `verticalId` INTEGER NOT NULL,
    `isRecurring` BOOLEAN NOT NULL DEFAULT false,
    `recurrence` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,

    INDEX `MaintenanceEvent_verticalId_idx`(`verticalId`),
    INDEX `MaintenanceEvent_scheduledDate_idx`(`scheduledDate`),
    INDEX `MaintenanceEvent_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `changes` JSON NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `AuditLog_userId_idx`(`userId`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MaintenanceEvent` ADD CONSTRAINT `MaintenanceEvent_verticalId_fkey` FOREIGN KEY (`verticalId`) REFERENCES `Vertical`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaintenanceEvent` ADD CONSTRAINT `MaintenanceEvent_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
