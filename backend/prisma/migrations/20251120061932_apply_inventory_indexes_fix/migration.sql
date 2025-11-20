-- AlterTable
ALTER TABLE `inventoryitem` ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `inventoryitemhistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inventoryItemId` INTEGER NOT NULL,
    `action` ENUM('CREATED', 'UPDATED', 'STATUS_CHANGED', 'DELETED', 'RESTORED') NOT NULL DEFAULT 'UPDATED',
    `changed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` VARCHAR(191) NULL,
    `diff` LONGTEXT NULL,
    `snapshot` LONGTEXT NULL,

    INDEX `InventoryItemHistory_inventoryItemId_idx`(`inventoryItemId`),
    INDEX `InventoryItemHistory_changed_at_idx`(`changed_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inventoryitemhistory` ADD CONSTRAINT `InventoryItemHistory_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `inventoryitem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
