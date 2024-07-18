/*
  Warnings:

  - Added the required column `enabled` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enabled` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enabled` to the `Model` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enabled` to the `Rental` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Rental` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enabled` to the `ServiceHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ServiceHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enabled` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Client` ADD COLUMN `enabled` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `File` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `enabled` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `Model` ADD COLUMN `enabled` BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE `Rental` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `enabled` BOOLEAN NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `ServiceHistory` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `enabled` BOOLEAN NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `enabled` BOOLEAN NOT NULL;
