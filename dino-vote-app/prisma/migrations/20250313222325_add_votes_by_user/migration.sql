-- CreateTable
CREATE TABLE `Vote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `dinosaurId` INTEGER NOT NULL,

    UNIQUE INDEX `Vote_userId_dinosaurId_key`(`userId`, `dinosaurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Login`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Vote` ADD CONSTRAINT `Vote_dinosaurId_fkey` FOREIGN KEY (`dinosaurId`) REFERENCES `Dinosaur`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
