/*
  Warnings:

  - You are about to drop the `appuser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `inventoryitem` DROP FOREIGN KEY `InventoryItem_created_by_id_fkey`;

-- DropForeignKey
ALTER TABLE `inventoryitem` DROP FOREIGN KEY `InventoryItem_updated_by_id_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_created_by_id_fkey`;

-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_updated_by_id_fkey`;

-- DropForeignKey
ALTER TABLE `orderhistory` DROP FOREIGN KEY `OrderHistory_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ordertask` DROP FOREIGN KEY `OrderTask_assigned_to_id_fkey`;

-- DropForeignKey
ALTER TABLE `ordertask` DROP FOREIGN KEY `OrderTask_checked_by_id_fkey`;

-- DropForeignKey
ALTER TABLE `ordertask` DROP FOREIGN KEY `OrderTask_validated_by_id_fkey`;

-- DropTable
DROP TABLE `appuser`;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderHistory` ADD CONSTRAINT `OrderHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderTask` ADD CONSTRAINT `OrderTask_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderTask` ADD CONSTRAINT `OrderTask_validated_by_id_fkey` FOREIGN KEY (`validated_by_id`) REFERENCES `account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderTask` ADD CONSTRAINT `OrderTask_checked_by_id_fkey` FOREIGN KEY (`checked_by_id`) REFERENCES `account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItem` ADD CONSTRAINT `InventoryItem_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InventoryItem` ADD CONSTRAINT `InventoryItem_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
