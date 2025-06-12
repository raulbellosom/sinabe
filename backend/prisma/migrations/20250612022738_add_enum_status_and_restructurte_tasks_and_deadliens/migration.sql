/*
  Warnings:

  - The primary key for the `Deadline` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `responsible` on the `Deadline` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `Deadline` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - The primary key for the `DeadlineTask` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `InventoryDeadline` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `status` on the `Project` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - The primary key for the `ProjectDocument` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ProjectMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PurchaseOrder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `order` to the `Deadline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `DeadlineTask` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `DeadlineTask` DROP FOREIGN KEY `DeadlineTask_deadlineId_fkey`;

-- DropForeignKey
ALTER TABLE `InventoryDeadline` DROP FOREIGN KEY `InventoryDeadline_deadlineId_fkey`;

-- DropForeignKey
ALTER TABLE `Invoice` DROP FOREIGN KEY `Invoice_purchaseOrderId_fkey`;

-- DropIndex
DROP INDEX `DeadlineTask_deadlineId_fkey` ON `DeadlineTask`;

-- DropIndex
DROP INDEX `InventoryDeadline_deadlineId_fkey` ON `InventoryDeadline`;

-- DropIndex
DROP INDEX `Invoice_purchaseOrderId_fkey` ON `Invoice`;

-- AlterTable
ALTER TABLE `Deadline` DROP PRIMARY KEY,
    DROP COLUMN `responsible`,
    ADD COLUMN `order` INTEGER NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `status` ENUM('PENDIENTE', 'EN_PROGRESO', 'EN_REVISION', 'COMPLETADO', 'CANCELADO', 'BLOQUEADO') NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `DeadlineTask` DROP PRIMARY KEY,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `order` INTEGER NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `deadlineId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `InventoryDeadline` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `deadlineId` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Invoice` MODIFY `purchaseOrderId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Project` MODIFY `status` ENUM('PLANIFICACION', 'EN_EJECUCION', 'EN_REVISION', 'FINALIZADO', 'CANCELADO', 'PAUSADO') NOT NULL;

-- AlterTable
ALTER TABLE `ProjectDocument` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `ProjectMember` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `PurchaseOrder` DROP PRIMARY KEY,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `_DeadlineUsers` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_DeadlineUsers_AB_unique`(`A`, `B`),
    INDEX `_DeadlineUsers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_TaskUsers` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_TaskUsers_AB_unique`(`A`, `B`),
    INDEX `_TaskUsers_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DeadlineTask` ADD CONSTRAINT `DeadlineTask_deadlineId_fkey` FOREIGN KEY (`deadlineId`) REFERENCES `Deadline`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryDeadline` ADD CONSTRAINT `InventoryDeadline_deadlineId_fkey` FOREIGN KEY (`deadlineId`) REFERENCES `Deadline`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DeadlineUsers` ADD CONSTRAINT `_DeadlineUsers_A_fkey` FOREIGN KEY (`A`) REFERENCES `Deadline`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DeadlineUsers` ADD CONSTRAINT `_DeadlineUsers_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TaskUsers` ADD CONSTRAINT `_TaskUsers_A_fkey` FOREIGN KEY (`A`) REFERENCES `DeadlineTask`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TaskUsers` ADD CONSTRAINT `_TaskUsers_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
