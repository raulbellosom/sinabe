/*
  Warnings:

  - A unique constraint covering the columns `[publicToken]` on the table `CustodyRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CustodyRecord` ADD COLUMN `delivererSignature` LONGTEXT NULL,
    ADD COLUMN `publicToken` VARCHAR(191) NULL,
    ADD COLUMN `receiverSignature` LONGTEXT NULL,
    ADD COLUMN `status` ENUM('BORRADOR', 'COMPLETADO') NOT NULL DEFAULT 'BORRADOR',
    ADD COLUMN `tokenExpiresAt` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CustodyRecord_publicToken_key` ON `CustodyRecord`(`publicToken`);
