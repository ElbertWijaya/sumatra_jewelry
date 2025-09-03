-- CreateTable
CREATE TABLE `AppUser` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `role` ENUM('admin', 'kasir', 'owner', 'pengrajin') NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AppUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `code` VARCHAR(191) NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `customerPhone` VARCHAR(191) NULL,
    `jenis` VARCHAR(191) NOT NULL,
    `kadar` INTEGER NULL,
    `beratTarget` DECIMAL(10, 2) NULL,
    `beratAkhir` DECIMAL(10, 2) NULL,
    `ongkos` DECIMAL(14, 2) NOT NULL,
    `dp` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `tanggalJanjiJadi` DATETIME(3) NULL,
    `catatan` VARCHAR(191) NULL,
    `fotoDesainUrl` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'DITERIMA', 'DALAM_PROSES', 'SIAP', 'DIAMBIL', 'BATAL') NOT NULL DEFAULT 'DRAFT',
    `createdById` VARCHAR(191) NULL,
    `updatedById` VARCHAR(191) NULL,

    UNIQUE INDEX `Order_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NULL,
    `changeSummary` VARCHAR(191) NULL,
    `diff` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `AppUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `AppUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderHistory` ADD CONSTRAINT `OrderHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderHistory` ADD CONSTRAINT `OrderHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `AppUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
