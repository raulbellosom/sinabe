-- AlterTable
ALTER TABLE `InAppNotification` ADD COLUMN `ruleCreatorId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `InAppNotification_ruleCreatorId_idx` ON `InAppNotification`(`ruleCreatorId`);

-- AddForeignKey
ALTER TABLE `InAppNotification` ADD CONSTRAINT `InAppNotification_ruleCreatorId_fkey` FOREIGN KEY (`ruleCreatorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
