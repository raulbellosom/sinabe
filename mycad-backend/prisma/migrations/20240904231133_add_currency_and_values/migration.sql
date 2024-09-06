-- AlterTable
ALTER TABLE `Vehicle` ADD COLUMN `bookValue` DOUBLE NULL,
    ADD COLUMN `bookValueCurrency` VARCHAR(191) NULL,
    ADD COLUMN `costCurrency` VARCHAR(191) NULL,
    ADD COLUMN `currentMarketValue` DOUBLE NULL,
    ADD COLUMN `marketValueCurrency` VARCHAR(191) NULL;
