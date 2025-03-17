-- DropIndex
DROP INDEX `Login_provider_id_key` ON `Login`;

-- AlterTable
ALTER TABLE `Login` MODIFY `provider_id` VARCHAR(191) NULL;
