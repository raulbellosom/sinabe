-- AlterTable
ALTER TABLE `PurchaseOrder` MODIFY `supplier` VARCHAR(191) NULL,
    MODIFY `amount` DOUBLE NULL,
    MODIFY `date` DATETIME(3) NULL;
