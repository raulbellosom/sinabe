-- CreateTable
CREATE TABLE `NotificationRule` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `ruleType` VARCHAR(191) NOT NULL,
    `params` JSON NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `scheduleType` VARCHAR(191) NOT NULL DEFAULT 'INTERVAL',
    `intervalMinutes` INTEGER NULL,
    `cronExpression` VARCHAR(191) NULL,
    `lastRunAt` DATETIME(3) NULL,
    `nextRunAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationRuleChannel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ruleId` VARCHAR(191) NOT NULL,
    `channel` ENUM('EMAIL', 'IN_APP', 'PUSH_WEB', 'PUSH_MOBILE') NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,

    INDEX `NotificationRuleChannel_ruleId_idx`(`ruleId`),
    UNIQUE INDEX `NotificationRuleChannel_ruleId_channel_key`(`ruleId`, `channel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationRuleRecipient` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ruleId` VARCHAR(191) NOT NULL,
    `kind` ENUM('USER', 'EMAIL') NOT NULL,
    `userId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `emailRole` ENUM('TO', 'CC', 'BCC') NOT NULL DEFAULT 'TO',

    INDEX `NotificationRuleRecipient_ruleId_idx`(`ruleId`),
    INDEX `NotificationRuleRecipient_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationRuleRun` (
    `id` VARCHAR(191) NOT NULL,
    `ruleId` VARCHAR(191) NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finishedAt` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'RUNNING',
    `matchCount` INTEGER NOT NULL DEFAULT 0,
    `result` JSON NULL,

    INDEX `NotificationRuleRun_ruleId_idx`(`ruleId`),
    INDEX `NotificationRuleRun_startedAt_idx`(`startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InAppNotification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `link` VARCHAR(191) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ruleRunId` VARCHAR(191) NULL,

    INDEX `InAppNotification_userId_idx`(`userId`),
    INDEX `InAppNotification_isRead_idx`(`isRead`),
    INDEX `InAppNotification_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationDelivery` (
    `id` VARCHAR(191) NOT NULL,
    `ruleRunId` VARCHAR(191) NOT NULL,
    `channel` ENUM('EMAIL', 'IN_APP', 'PUSH_WEB', 'PUSH_MOBILE') NOT NULL,
    `recipientId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `errorMsg` TEXT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sentAt` DATETIME(3) NULL,

    INDEX `NotificationDelivery_ruleRunId_idx`(`ruleRunId`),
    INDEX `NotificationDelivery_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PushSubscription` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `endpoint` TEXT NOT NULL,
    `keys` JSON NOT NULL,
    `deviceType` VARCHAR(191) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PushSubscription_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NotificationRuleChannel` ADD CONSTRAINT `NotificationRuleChannel_ruleId_fkey` FOREIGN KEY (`ruleId`) REFERENCES `NotificationRule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationRuleRecipient` ADD CONSTRAINT `NotificationRuleRecipient_ruleId_fkey` FOREIGN KEY (`ruleId`) REFERENCES `NotificationRule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationRuleRun` ADD CONSTRAINT `NotificationRuleRun_ruleId_fkey` FOREIGN KEY (`ruleId`) REFERENCES `NotificationRule`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationDelivery` ADD CONSTRAINT `NotificationDelivery_ruleRunId_fkey` FOREIGN KEY (`ruleRunId`) REFERENCES `NotificationRuleRun`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
