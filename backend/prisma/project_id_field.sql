ALTER TABLE `Inventory`
ADD COLUMN `projectId` INTEGER NULL AFTER `modelId`;

ALTER TABLE `Inventory`
ADD CONSTRAINT `Inventory_projectId_fkey`
FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`)
ON DELETE SET NULL ON UPDATE CASCADE;
