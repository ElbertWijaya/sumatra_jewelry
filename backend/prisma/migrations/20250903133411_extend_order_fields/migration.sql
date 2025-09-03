/*
  Warnings:

  - Added the required column `jenisEmas` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `warnaEmas` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `customerAddress` VARCHAR(191) NULL,
    ADD COLUMN `hargaAkhir` DECIMAL(14, 2) NULL,
    ADD COLUMN `hargaEmasPerGram` DECIMAL(14, 2) NULL,
    ADD COLUMN `hargaPerkiraan` DECIMAL(14, 2) NULL,
    ADD COLUMN `jenisEmas` VARCHAR(191) NOT NULL,
    ADD COLUMN `referensiGambarUrl` VARCHAR(191) NULL,
    ADD COLUMN `tanggalAmbil` DATETIME(3) NULL,
    ADD COLUMN `tanggalSelesai` DATETIME(3) NULL,
    ADD COLUMN `warnaEmas` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `OrderStone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `bentuk` VARCHAR(191) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `berat` DECIMAL(10, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OrderStone_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderStone` ADD CONSTRAINT `OrderStone_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
