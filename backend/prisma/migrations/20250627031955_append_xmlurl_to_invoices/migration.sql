-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `xmlUrl` TEXT NULL,
    MODIFY `fileUrl` TEXT NULL;
