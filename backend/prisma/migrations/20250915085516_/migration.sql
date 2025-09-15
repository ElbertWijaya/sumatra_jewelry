-- CreateTable
CREATE TABLE `InventoryItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NULL,
    `code` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `category` VARCHAR(191) NULL,
    `material` VARCHAR(191) NULL,
    `karat` VARCHAR(191) NULL,
    `gold_type` VARCHAR(191) NULL,
    `gold_color` VARCHAR(191) NULL,
    `weight_gross` DECIMAL(10, 2) NULL,
    `weight_net` DECIMAL(10, 2) NULL,
    `stone_count` INTEGER NULL,
    `stone_weight` DECIMAL(10, 2) NULL,
    `size` VARCHAR(191) NULL,
    `dimensions` VARCHAR(191) NULL,
    `barcode` VARCHAR(191) NULL,
    `sku` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `cost` DECIMAL(14, 2) NULL,
    `price` DECIMAL(14, 2) NULL,
    `status` VARCHAR(191) NULL,
    `images` JSON NULL,
    `notes` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `created_by_id` VARCHAR(191) NULL,
    `updated_by_id` VARCHAR(191) NULL,

    UNIQUE INDEX `InventoryItem_barcode_key`(`barcode`),
    UNIQUE INDEX `InventoryItem_sku_key`(`sku`),
    INDEX `InventoryItem_orderId_idx`(`orderId`),
    INDEX `InventoryItem_barcode_idx`(`barcode`),
    INDEX `InventoryItem_sku_idx`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InventoryItem` ADD CONSTRAINT `InventoryItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItem` ADD CONSTRAINT `InventoryItem_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `AppUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItem` ADD CONSTRAINT `InventoryItem_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `AppUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Removed problematic index redefinition to avoid dropping a non-existent index
