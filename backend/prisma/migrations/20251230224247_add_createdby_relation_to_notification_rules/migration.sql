-- CreateIndex
CREATE INDEX `NotificationRule_createdById_idx` ON `NotificationRule`(`createdById`);

-- AddForeignKey
ALTER TABLE `NotificationRule` ADD CONSTRAINT `NotificationRule_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
