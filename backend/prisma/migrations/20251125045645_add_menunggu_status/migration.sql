/*
  Warnings:

  - You are about to alter the column `status` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(3))`.
  - The values [DRAFT] on the enum `orderhistory_statusFrom` will be removed. If these variants are still used in the database, this will fail.
  - The values [DRAFT] on the enum `orderhistory_statusTo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `order` MODIFY `status` ENUM('MENUNGGU', 'DITERIMA', 'DALAM_PROSES', 'SIAP', 'DIAMBIL', 'BATAL') NOT NULL DEFAULT 'MENUNGGU';

-- AlterTable
ALTER TABLE `orderhistory` MODIFY `statusFrom` ENUM('MENUNGGU', 'DITERIMA', 'DALAM_PROSES', 'SIAP', 'DIAMBIL', 'BATAL') NULL,
    MODIFY `statusTo` ENUM('MENUNGGU', 'DITERIMA', 'DALAM_PROSES', 'SIAP', 'DIAMBIL', 'BATAL') NULL;
