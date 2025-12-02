-- DropForeignKey
ALTER TABLE `File` DROP FOREIGN KEY `File_inventoryId_fkey`;

-- AlterTable
ALTER TABLE `File` MODIFY `inventoryId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `employeeNumber` VARCHAR(191) NULL,
    ADD COLUMN `jobTitle` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `CustodyRecord` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `date` DATETIME(3) NOT NULL,
    `receiverId` VARCHAR(191) NOT NULL,
    `delivererId` VARCHAR(191) NOT NULL,
    `comments` TEXT NULL,
    `fileId` VARCHAR(191) NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CustodyRecord_code_key`(`code`),
    INDEX `CustodyRecord_receiverId_idx`(`receiverId`),
    INDEX `CustodyRecord_delivererId_idx`(`delivererId`),
    INDEX `CustodyRecord_fileId_idx`(`fileId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CustodyItem` (
    `id` VARCHAR(191) NOT NULL,
    `custodyRecordId` VARCHAR(191) NOT NULL,
    `inventoryId` VARCHAR(191) NOT NULL,
    `typeBrand` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `serialNumber` VARCHAR(191) NULL,
    `assetNumber` VARCHAR(191) NULL,
    `invoiceNumber` VARCHAR(191) NULL,
    `features` VARCHAR(191) NULL,

    INDEX `CustodyItem_custodyRecordId_idx`(`custodyRecordId`),
    INDEX `CustodyItem_inventoryId_idx`(`inventoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `Inventory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustodyRecord` ADD CONSTRAINT `CustodyRecord_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustodyRecord` ADD CONSTRAINT `CustodyRecord_delivererId_fkey` FOREIGN KEY (`delivererId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustodyRecord` ADD CONSTRAINT `CustodyRecord_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `File`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustodyItem` ADD CONSTRAINT `CustodyItem_custodyRecordId_fkey` FOREIGN KEY (`custodyRecordId`) REFERENCES `CustodyRecord`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustodyItem` ADD CONSTRAINT `CustodyItem_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `Inventory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
