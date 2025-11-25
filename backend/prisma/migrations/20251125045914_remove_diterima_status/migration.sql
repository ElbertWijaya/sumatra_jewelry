/*
  Warnings:

  - The values [DITERIMA] on the enum `order_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [DITERIMA] on the enum `orderhistory_statusFrom` will be removed. If these variants are still used in the database, this will fail.
  - The values [DITERIMA] on the enum `orderhistory_statusTo` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `order` MODIFY `status` ENUM('MENUNGGU', 'DALAM_PROSES', 'SIAP', 'DIAMBIL', 'BATAL') NOT NULL DEFAULT 'MENUNGGU';

-- AlterTable
ALTER TABLE `orderhistory` MODIFY `statusFrom` ENUM('MENUNGGU', 'DALAM_PROSES', 'SIAP', 'DIAMBIL', 'BATAL') NULL,
    MODIFY `statusTo` ENUM('MENUNGGU', 'DALAM_PROSES', 'SIAP', 'DIAMBIL', 'BATAL') NULL;
