/*
  Warnings:

  - You are about to drop the column `beratAkhir` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `catatan` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `customerAddress` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `customerPhone` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `dp` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `fotoDesainUrl` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `hargaAkhir` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `hargaEmasPerGram` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `hargaPerkiraan` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `jenis` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `jenisEmas` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `ongkos` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `referensiGambarUrl` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `referensiGambarUrls` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalAmbil` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalJanjiJadi` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalSelesai` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `warnaEmas` on the `order` table. All the data in the column will be lost.
  - Added the required column `customer_name` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gold_color` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gold_type` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item_type` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `labor_cost` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_updatedById_fkey`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `beratAkhir`,
    DROP COLUMN `catatan`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `createdById`,
    DROP COLUMN `customerAddress`,
    DROP COLUMN `customerName`,
    DROP COLUMN `customerPhone`,
    DROP COLUMN `dp`,
    DROP COLUMN `fotoDesainUrl`,
    DROP COLUMN `hargaAkhir`,
    DROP COLUMN `hargaEmasPerGram`,
    DROP COLUMN `hargaPerkiraan`,
    DROP COLUMN `jenis`,
    DROP COLUMN `jenisEmas`,
    DROP COLUMN `ongkos`,
    DROP COLUMN `referensiGambarUrl`,
    DROP COLUMN `referensiGambarUrls`,
    DROP COLUMN `tanggalAmbil`,
    DROP COLUMN `tanggalJanjiJadi`,
    DROP COLUMN `tanggalSelesai`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `updatedById`,
    DROP COLUMN `warnaEmas`,
    ADD COLUMN `completed_date` DATETIME(3) NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `created_by_id` VARCHAR(191) NULL,
    ADD COLUMN `customer_address` VARCHAR(191) NULL,
    ADD COLUMN `customer_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `customer_phone` VARCHAR(191) NULL,
    ADD COLUMN `design_image_url` VARCHAR(191) NULL,
    ADD COLUMN `down_payment` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `estimated_price` DECIMAL(14, 2) NULL,
    ADD COLUMN `final_price` DECIMAL(14, 2) NULL,
    ADD COLUMN `final_weight` DECIMAL(10, 2) NULL,
    ADD COLUMN `gold_color` VARCHAR(191) NOT NULL,
    ADD COLUMN `gold_price_per_gram` DECIMAL(14, 2) NULL,
    ADD COLUMN `gold_type` VARCHAR(191) NOT NULL,
    ADD COLUMN `item_type` VARCHAR(191) NOT NULL,
    ADD COLUMN `labor_cost` DECIMAL(14, 2) NOT NULL,
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `pickup_date` DATETIME(3) NULL,
    ADD COLUMN `promised_date` DATETIME(3) NULL,
    ADD COLUMN `reference_image_url` VARCHAR(191) NULL,
    ADD COLUMN `reference_image_urls` JSON NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `updated_by_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `AppUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `AppUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
