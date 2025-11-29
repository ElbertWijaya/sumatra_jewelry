/*
  Warnings:

  - You are about to drop the column `size` on the `inventoryitem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `inventoryitem` DROP COLUMN `size`,
    ADD COLUMN `ring_size` VARCHAR(191) NULL;
