-- Drop final_weight column from Order
ALTER TABLE `Order` DROP COLUMN `final_weight`;

-- Make down_payment nullable and remove default 0
ALTER TABLE `Order` MODIFY COLUMN `down_payment` DECIMAL(14,2) NULL;