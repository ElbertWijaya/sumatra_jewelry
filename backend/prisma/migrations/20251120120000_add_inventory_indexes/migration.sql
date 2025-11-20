-- Add indexes after branch_location & placement_location columns exist
CREATE INDEX `InventoryItem_loc_status_idx` ON `inventoryitem`(`branch_location`, `placement_location`, `status_enum`);
CREATE UNIQUE INDEX `InventoryItem_code_branch_location_key` ON `inventoryitem`(`code`, `branch_location`);
