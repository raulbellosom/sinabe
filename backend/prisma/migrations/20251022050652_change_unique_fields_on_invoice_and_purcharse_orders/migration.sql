/*
  Warnings:

  - You are about to drop the column `amount` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PurchaseOrder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code,enabled]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,enabled]` on the table `PurchaseOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Invoice` DROP FOREIGN KEY `Invoice_purchaseOrderId_fkey`;

-- DropIndex
DROP INDEX `PurchaseOrder_code_key` ON `PurchaseOrder`;

-- AlterTable
ALTER TABLE `Inventory` ADD COLUMN `purchaseOrderId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Invoice` DROP COLUMN `amount`,
    DROP COLUMN `date`,
    DROP COLUMN `status`,
    MODIFY `purchaseOrderId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `PurchaseOrder` DROP COLUMN `amount`,
    DROP COLUMN `date`,
    DROP COLUMN `status`;

-- CreateIndex
CREATE INDEX `Inventory_purchaseOrderId_fkey` ON `Inventory`(`purchaseOrderId`);

-- CreateIndex
CREATE UNIQUE INDEX `Invoice_code_enabled_key` ON `Invoice`(`code`, `enabled`);

-- CreateIndex
CREATE UNIQUE INDEX `PurchaseOrder_code_enabled_key` ON `PurchaseOrder`(`code`, `enabled`);

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
