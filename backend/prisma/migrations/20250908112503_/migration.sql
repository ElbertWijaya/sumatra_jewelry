/*
  Warnings:

  - You are about to drop the column `approvedById` on the `ordertask` table. All the data in the column will be lost.
  - You are about to drop the column `assignedToId` on the `ordertask` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ordertask` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ordertask` table. All the data in the column will be lost.
  - You are about to drop the column `dueDate` on the `ordertask` table. All the data in the column will be lost.
  - You are about to drop the column `lastSubmissionNote` on the `ordertask` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `ordertask` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ordertask` table. All the data in the column will be lost.
  - The values [IN_REVIEW,APPROVED,REJECTED] on the enum `OrderTask_status` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updated_at` to the `OrderTask` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ordertask` DROP FOREIGN KEY `OrderTask_approvedById_fkey`;

-- DropForeignKey
ALTER TABLE `ordertask` DROP FOREIGN KEY `OrderTask_assignedToId_fkey`;

-- DropIndex
DROP INDEX `OrderTask_status_idx` ON `ordertask`;

-- AlterTable
ALTER TABLE `ordertask` DROP COLUMN `approvedById`,
    DROP COLUMN `assignedToId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `description`,
    DROP COLUMN `dueDate`,
    DROP COLUMN `lastSubmissionNote`,
    DROP COLUMN `title`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `assigned_to_id` VARCHAR(191) NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `notes` VARCHAR(191) NULL,
    ADD COLUMN `requested_done_at` DATETIME(3) NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `validated_at` DATETIME(3) NULL,
    ADD COLUMN `validated_by_id` VARCHAR(191) NULL,
    MODIFY `status` ENUM('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'AWAITING_VALIDATION', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'OPEN';

-- AddForeignKey
ALTER TABLE `OrderTask` ADD CONSTRAINT `OrderTask_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `AppUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderTask` ADD CONSTRAINT `OrderTask_validated_by_id_fkey` FOREIGN KEY (`validated_by_id`) REFERENCES `AppUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
