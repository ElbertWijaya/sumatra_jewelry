-- AlterTable
ALTER TABLE `ordertask` ADD COLUMN `checked_at` DATETIME(3) NULL,
    ADD COLUMN `checked_by_id` VARCHAR(191) NULL,
    ADD COLUMN `is_checked` BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE `OrderTask` ADD CONSTRAINT `OrderTask_checked_by_id_fkey` FOREIGN KEY (`checked_by_id`) REFERENCES `AppUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
