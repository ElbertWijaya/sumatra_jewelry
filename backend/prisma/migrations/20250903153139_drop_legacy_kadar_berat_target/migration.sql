/*
  Warnings:

  - You are about to drop the column `beratTarget` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `kadar` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `beratTarget`,
    DROP COLUMN `kadar`;
