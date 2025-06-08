ALTER TABLE `Inventory`
ADD COLUMN `internalFolio` VARCHAR(191) NULL
AFTER `createdById`;
