-- Add summary columns to Order (mapped names in schema)
ALTER TABLE `Order`
  ADD COLUMN `stone_count` INT NOT NULL DEFAULT 0,
  ADD COLUMN `total_stone_weight` DECIMAL(10,2) NULL;

-- Backfill existing orders
UPDATE `Order` o
LEFT JOIN (
  SELECT s.`orderId` AS oid, COUNT(*) AS cnt, SUM(s.`berat`) AS total
  FROM `OrderStone` s
  GROUP BY s.`orderId`
) x ON x.oid = o.`id`
SET o.`stone_count` = COALESCE(x.cnt, 0),
    o.`total_stone_weight` = x.total;
