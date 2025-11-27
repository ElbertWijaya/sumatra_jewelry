/*
  Warnings:

  - You are about to drop the column `location` on the `inventoryitem` table. All the data in the column will be lost.
  - You are about to drop the column `material` on the `inventoryitem` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `inventoryitem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `inventoryitem` DROP COLUMN `location`,
    DROP COLUMN `material`,
    DROP COLUMN `notes`;
