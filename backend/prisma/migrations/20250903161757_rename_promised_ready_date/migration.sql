/*
  Warnings:

  - You are about to drop the column `promised_date` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `promised_date`,
    ADD COLUMN `promised_ready_date` DATETIME(3) NULL;
