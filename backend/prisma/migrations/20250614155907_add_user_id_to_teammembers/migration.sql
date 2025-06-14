/*
  Warnings:

  - Added the required column `userId` to the `ProjectMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ProjectMember` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `ProjectMember_userId_idx` ON `ProjectMember`(`userId`);

-- AddForeignKey
ALTER TABLE `ProjectMember` ADD CONSTRAINT `ProjectMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `ProjectMember` RENAME INDEX `ProjectMember_projectId_fkey` TO `ProjectMember_projectId_idx`;
