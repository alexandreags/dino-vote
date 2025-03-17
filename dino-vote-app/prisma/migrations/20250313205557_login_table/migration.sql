/*
  Warnings:

  - A unique constraint covering the columns `[provider_id]` on the table `Login` will be added. If there are existing duplicate values, this will fail.
  - Made the column `provider_id` on table `Login` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Login` MODIFY `provider_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Login_provider_id_key` ON `Login`(`provider_id`);
