-- RedefineIndex (adjusted): create missing index only, don't drop non-existent FK index
CREATE INDEX `OrderTask_assigned_to_id_idx` ON `OrderTask`(`assigned_to_id`);
