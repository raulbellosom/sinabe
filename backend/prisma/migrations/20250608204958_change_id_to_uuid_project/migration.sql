/*
  Warnings:

  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `Deadline` DROP FOREIGN KEY `Deadline_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `Inventory` DROP FOREIGN KEY `Inventory_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `ProjectDocument` DROP FOREIGN KEY `ProjectDocument_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `ProjectMember` DROP FOREIGN KEY `ProjectMember_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `PurchaseOrder` DROP FOREIGN KEY `PurchaseOrder_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `_ProjectVerticalsOnProjects` DROP FOREIGN KEY `_ProjectVerticalsOnProjects_A_fkey`;

-- DropIndex
DROP INDEX `Deadline_projectId_fkey` ON `Deadline`;

-- DropIndex
DROP INDEX `Inventory_projectId_fkey` ON `Inventory`;

-- DropIndex
DROP INDEX `ProjectDocument_projectId_fkey` ON `ProjectDocument`;

-- DropIndex
DROP INDEX `ProjectMember_projectId_fkey` ON `ProjectMember`;

-- DropIndex
DROP INDEX `PurchaseOrder_projectId_fkey` ON `PurchaseOrder`;

-- AlterTable
ALTER TABLE `Deadline` MODIFY `projectId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Inventory` MODIFY `projectId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Project` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `ProjectDocument` MODIFY `projectId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `ProjectMember` MODIFY `projectId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `PurchaseOrder` MODIFY `projectId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `_ProjectVerticalsOnProjects` MODIFY `A` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deadline` ADD CONSTRAINT `Deadline_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectMember` ADD CONSTRAINT `ProjectMember_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectDocument` ADD CONSTRAINT `ProjectDocument_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectVerticalsOnProjects` ADD CONSTRAINT `_ProjectVerticalsOnProjects_A_fkey` FOREIGN KEY (`A`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
