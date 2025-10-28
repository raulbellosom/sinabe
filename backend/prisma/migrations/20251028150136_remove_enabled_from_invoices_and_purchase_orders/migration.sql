/*
  Warnings:

  - You are about to drop the column `enabled` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `enabled` on the `PurchaseOrder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `PurchaseOrder` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Invoice_code_enabled_key` ON `Invoice`;

-- DropIndex
DROP INDEX `PurchaseOrder_code_enabled_key` ON `PurchaseOrder`;

-- AlterTable
ALTER TABLE `Invoice` DROP COLUMN `enabled`;

-- AlterTable
ALTER TABLE `PurchaseOrder` DROP COLUMN `enabled`;

-- CreateIndex
CREATE UNIQUE INDEX `Invoice_code_key` ON `Invoice`(`code`);

-- CreateIndex
CREATE UNIQUE INDEX `PurchaseOrder_code_key` ON `PurchaseOrder`(`code`);
