/*
  Warnings:

  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `inventoryId` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `orderDate` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the `ProjectFiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectImage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[internalFolio]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `PurchaseOrder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `budgetTotal` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Made the column `endDate` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `code` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplier` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Made the column `projectId` on table `PurchaseOrder` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `ProjectFiles` DROP FOREIGN KEY `ProjectFiles_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `ProjectImage` DROP FOREIGN KEY `ProjectImage_projectId_fkey`;

-- DropForeignKey
ALTER TABLE `PurchaseOrder` DROP FOREIGN KEY `PurchaseOrder_inventoryId_fkey`;

-- DropForeignKey
ALTER TABLE `PurchaseOrder` DROP FOREIGN KEY `PurchaseOrder_projectId_fkey`;

-- DropIndex
DROP INDEX `PurchaseOrder_inventoryId_fkey` ON `PurchaseOrder`;

-- DropIndex
DROP INDEX `PurchaseOrder_projectId_fkey` ON `PurchaseOrder`;

-- AlterTable
ALTER TABLE `Inventory` ADD COLUMN `internalFolio` VARCHAR(191) NULL,
    ADD COLUMN `projectId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Project` DROP PRIMARY KEY,
    ADD COLUMN `budgetTotal` DOUBLE NOT NULL,
    ADD COLUMN `budgetUsed` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `code` VARCHAR(191) NOT NULL,
    ADD COLUMN `createdById` VARCHAR(191) NOT NULL,
    ADD COLUMN `provider` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `endDate` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `PurchaseOrder` DROP COLUMN `inventoryId`,
    DROP COLUMN `orderDate`,
    ADD COLUMN `code` VARCHAR(191) NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdById` VARCHAR(191) NOT NULL,
    ADD COLUMN `date` DATETIME(3) NOT NULL,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `status` VARCHAR(191) NOT NULL,
    ADD COLUMN `supplier` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `projectId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `ProjectFiles`;

-- DropTable
DROP TABLE `ProjectImage`;

-- CreateTable
CREATE TABLE `Deadline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `responsible` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `createdById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DeadlineTask` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `deadlineId` INTEGER NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InventoryDeadline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inventoryId` VARCHAR(191) NOT NULL,
    `deadlineId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `concept` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `fileUrl` VARCHAR(191) NULL,
    `purchaseOrderId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `createdById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectMember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectDocument` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `uploadDate` DATETIME(3) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectVertical` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `ProjectVertical_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProjectVerticalsOnProjects` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ProjectVerticalsOnProjects_AB_unique`(`A`, `B`),
    INDEX `_ProjectVerticalsOnProjects_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Inventory_internalFolio_key` ON `Inventory`(`internalFolio`);

-- CreateIndex
CREATE UNIQUE INDEX `Project_code_key` ON `Project`(`code`);

-- CreateIndex
CREATE UNIQUE INDEX `PurchaseOrder_code_key` ON `PurchaseOrder`(`code`);

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deadline` ADD CONSTRAINT `Deadline_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DeadlineTask` ADD CONSTRAINT `DeadlineTask_deadlineId_fkey` FOREIGN KEY (`deadlineId`) REFERENCES `Deadline`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryDeadline` ADD CONSTRAINT `InventoryDeadline_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `Inventory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryDeadline` ADD CONSTRAINT `InventoryDeadline_deadlineId_fkey` FOREIGN KEY (`deadlineId`) REFERENCES `Deadline`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectMember` ADD CONSTRAINT `ProjectMember_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectDocument` ADD CONSTRAINT `ProjectDocument_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectVerticalsOnProjects` ADD CONSTRAINT `_ProjectVerticalsOnProjects_A_fkey` FOREIGN KEY (`A`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectVerticalsOnProjects` ADD CONSTRAINT `_ProjectVerticalsOnProjects_B_fkey` FOREIGN KEY (`B`) REFERENCES `ProjectVertical`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
