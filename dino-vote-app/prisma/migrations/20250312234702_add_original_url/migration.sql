-- AlterTable
ALTER TABLE `Dinosaur` ADD COLUMN `originalUrl` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Dinosaur_originalUrl_idx` ON `Dinosaur`(`originalUrl`);
