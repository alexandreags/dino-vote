/*
  Warnings:

  - A unique constraint covering the columns `[provider_id]` on the table `Login` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Login_provider_id_key` ON `Login`(`provider_id`);
