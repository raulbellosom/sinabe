/*
  Warnings:

  - Added the required column `createdById` to the `Deadline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Deadline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `DeadlineTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DeadlineTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `ProjectDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProjectDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Deadline` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdById` VARCHAR(191) NOT NULL,
    ADD COLUMN `enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `DeadlineTask` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdById` VARCHAR(191) NOT NULL,
    ADD COLUMN `enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdById` VARCHAR(191) NOT NULL,
    ADD COLUMN `enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Project` ADD COLUMN `createdById` VARCHAR(191) NOT NULL,
    ADD COLUMN `enabled` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `ProjectDocument` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdById` VARCHAR(191) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `PurchaseOrder` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `createdById` VARCHAR(191) NOT NULL,
    ADD COLUMN `enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
