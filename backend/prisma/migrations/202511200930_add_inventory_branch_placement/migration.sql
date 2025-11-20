-- Safe migration: add branch_location and placement_location enum columns
-- Assumes MySQL 8.x

ALTER TABLE `inventoryitem`
  ADD COLUMN `branch_location` ENUM('ASIA','SUN_PLAZA') NULL AFTER `location`,
  ADD COLUMN `placement_location` ENUM('ETALASE','PENYIMPANAN') NULL AFTER `branch_location`;

-- No data transformation performed. Existing free-form `location` preserved.
-- If desired, backfill branch_location based on patterns in `location` later.
