/*
  Warnings:

  - A unique constraint covering the columns `[code,branch_location]` on the table `inventoryitem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `inventoryitem` ADD COLUMN `status_enum` ENUM('DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'RETURNED', 'DAMAGED') NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE `inventorystone` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inventoryItemId` INTEGER NOT NULL,
    `bentuk` VARCHAR(191) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `berat` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `InventoryStone_bentuk_idx`(`bentuk`),
    INDEX `InventoryStone_inventoryItemId_idx`(`inventoryItemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Removed early index creations; will be applied in a later migration once columns exist.

-- AddForeignKey
ALTER TABLE `inventorystone` ADD CONSTRAINT `InventoryStone_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `inventoryitem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
