/*
  Warnings:

  - You are about to drop the column `reference_image_url` on the `order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `order` DROP COLUMN `reference_image_url`;
