-- CreateTable
CREATE TABLE `OrderTask` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `title` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `stage` VARCHAR(191) NULL,
    `status` ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'DONE') NOT NULL DEFAULT 'OPEN',
    `assignedToId` VARCHAR(191) NULL,
    `lastSubmissionNote` VARCHAR(191) NULL,
    `approvedById` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `OrderTask_orderId_idx`(`orderId`),
    INDEX `OrderTask_assignedToId_idx`(`assignedToId`),
    INDEX `OrderTask_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderTask` ADD CONSTRAINT `OrderTask_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderTask` ADD CONSTRAINT `OrderTask_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `AppUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderTask` ADD CONSTRAINT `OrderTask_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `AppUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
