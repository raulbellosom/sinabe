-- DropForeignKey
ALTER TABLE `PurchaseOrder` DROP FOREIGN KEY `PurchaseOrder_projectId_fkey`;

-- AlterTable
ALTER TABLE `PurchaseOrder` MODIFY `projectId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
