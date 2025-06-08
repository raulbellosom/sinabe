-- AlterTable
ALTER TABLE `Project` DROP COLUMN `client`,
    ADD COLUMN `provider` VARCHAR(191) NOT NULL;