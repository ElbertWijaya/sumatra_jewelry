ALTER TABLE `orderhistory` ADD COLUMN `action` ENUM('CREATED', 'UPDATED', 'STATUS_CHANGED', 'NOTE_ADDED', 'TASK_EVENT', 'DELETED') NOT NULL DEFAULT 'UPDATED',
    ADD COLUMN `actorName` VARCHAR(191) NULL,
    ADD COLUMN `actorRole` ENUM('ADMINISTRATOR', 'SALES', 'DESIGNER', 'CASTER', 'CARVER', 'DIAMOND_SETTER', 'FINISHER', 'INVENTORY') NULL,
    ADD COLUMN `context` JSON NULL,
    ADD COLUMN `field` VARCHAR(191) NULL,
    ADD COLUMN `groupId` VARCHAR(191) NULL,
    ADD COLUMN `next` JSON NULL,
    ADD COLUMN `orderCode` VARCHAR(191) NULL,
    ADD COLUMN `prev` JSON NULL,
    ADD COLUMN `snapshot` JSON NULL,
    ADD COLUMN `statusFrom` ENUM('DRAFT', 'DITERIMA', 'DALAM_PROSES', 'SIAP', 'DIAMBIL', 'BATAL') NULL,
    ADD COLUMN `statusTo` ENUM('DRAFT', 'DITERIMA', 'DALAM_PROSES', 'SIAP', 'DIAMBIL', 'BATAL') NULL;

CREATE INDEX `OrderHistory_orderId_changedAt_idx` ON `OrderHistory`(`orderId`, `changedAt`);

CREATE INDEX `OrderHistory_action_idx` ON `OrderHistory`(`action`);

CREATE INDEX `OrderHistory_field_idx` ON `OrderHistory`(`field`);

CREATE INDEX `OrderHistory_userId_idx` ON `OrderHistory`(`userId`);
