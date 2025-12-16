-- CreateTable
CREATE TABLE `pushtoken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pushtoken_token_key`(`token`),
    INDEX `PushToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pushtoken` ADD CONSTRAINT `pushtoken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
