/*
  Warnings:

  - You are about to drop the column `projectId` on the `Inventory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Inventory` DROP FOREIGN KEY `Inventory_projectId_fkey`;

-- DropIndex
DROP INDEX `Inventory_projectId_fkey` ON `Inventory`;

-- AlterTable
ALTER TABLE `Inventory` DROP COLUMN `projectId`,
    ADD COLUMN `invoiceId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
