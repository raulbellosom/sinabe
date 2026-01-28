-- AlterTable
ALTER TABLE `AuditLog` ADD COLUMN `entityTitle` VARCHAR(191) NULL;
ALTER TABLE `AuditLog` MODIFY `changes` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `Event` ADD COLUMN `recurrenceEndDate` DATETIME(3) NULL;
ALTER TABLE `Event` ADD COLUMN `seriesId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Event_seriesId_idx` ON `Event`(`seriesId`);
