-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               12.0.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for sumatra_jewelry
CREATE DATABASE IF NOT EXISTS `sumatra_jewelry` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `sumatra_jewelry`;

-- Dumping structure for table sumatra_jewelry.account
CREATE TABLE IF NOT EXISTS `account` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `job_role` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_email_key` (`email`),
  KEY `account_branch_id_fkey` (`branch_id`),
  CONSTRAINT `account_branch_id_fkey` FOREIGN KEY (`branch_id`) REFERENCES `branch` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table sumatra_jewelry.branch
CREATE TABLE IF NOT EXISTS `branch` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `address` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table sumatra_jewelry.inventoryitem
CREATE TABLE IF NOT EXISTS `inventoryitem` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderId` int(11) DEFAULT NULL,
  `code` varchar(191) DEFAULT NULL,
  `name` varchar(191) DEFAULT NULL,
  `category` varchar(191) DEFAULT NULL,
  `gold_type` varchar(191) DEFAULT NULL,
  `gold_color` varchar(191) DEFAULT NULL,
  `weight_gross` decimal(10,2) DEFAULT NULL,
  `weight_net` decimal(10,2) DEFAULT NULL,
  `stone_count` int(11) DEFAULT NULL,
  `stone_weight` decimal(10,2) DEFAULT NULL,
  `dimensions` varchar(191) DEFAULT NULL,
  `barcode` varchar(191) DEFAULT NULL,
  `sku` varchar(191) DEFAULT NULL,
  `branch_location` enum('ASIA','SUN_PLAZA') DEFAULT NULL,
  `placement_location` enum('ETALASE','PENYIMPANAN') DEFAULT NULL,
  `cost` decimal(14,2) DEFAULT NULL,
  `price` decimal(14,2) DEFAULT NULL,
  `status` varchar(191) DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `created_by_id` varchar(191) DEFAULT NULL,
  `updated_by_id` varchar(191) DEFAULT NULL,
  `status_enum` enum('DRAFT','ACTIVE','RESERVED','SOLD','RETURNED','DAMAGED') NOT NULL DEFAULT 'DRAFT',
  `deleted_at` datetime(3) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `ring_size` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `InventoryItem_barcode_key` (`barcode`),
  UNIQUE KEY `InventoryItem_sku_key` (`sku`),
  UNIQUE KEY `InventoryItem_code_branch_location_key` (`code`,`branch_location`),
  KEY `InventoryItem_orderId_idx` (`orderId`),
  KEY `InventoryItem_barcode_idx` (`barcode`),
  KEY `InventoryItem_sku_idx` (`sku`),
  KEY `InventoryItem_created_by_id_fkey` (`created_by_id`),
  KEY `InventoryItem_updated_by_id_fkey` (`updated_by_id`),
  KEY `InventoryItem_loc_status_idx` (`branch_location`,`placement_location`,`status_enum`),
  CONSTRAINT `InventoryItem_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `InventoryItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `InventoryItem_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table sumatra_jewelry.inventoryitemhistory
CREATE TABLE IF NOT EXISTS `inventoryitemhistory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `inventoryItemId` int(11) NOT NULL,
  `action` enum('CREATED','UPDATED','STATUS_CHANGED','DELETED','RESTORED') NOT NULL DEFAULT 'UPDATED',
  `changed_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `user_id` varchar(191) DEFAULT NULL,
  `diff` longtext DEFAULT NULL,
  `snapshot` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `InventoryItemHistory_inventoryItemId_idx` (`inventoryItemId`),
  KEY `InventoryItemHistory_changed_at_idx` (`changed_at`),
  CONSTRAINT `InventoryItemHistory_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `inventoryitem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table sumatra_jewelry.inventorystone
CREATE TABLE IF NOT EXISTS `inventorystone` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `inventoryItemId` int(11) NOT NULL,
  `bentuk` varchar(191) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `berat` decimal(10,2) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `InventoryStone_bentuk_idx` (`bentuk`),
  KEY `InventoryStone_inventoryItemId_idx` (`inventoryItemId`),
  CONSTRAINT `InventoryStone_inventoryItemId_fkey` FOREIGN KEY (`inventoryItemId`) REFERENCES `inventoryitem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table sumatra_jewelry.order
CREATE TABLE IF NOT EXISTS `order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(191) DEFAULT NULL,
  `status` enum('MENUNGGU','DALAM_PROSES','SIAP','DIAMBIL','BATAL') NOT NULL DEFAULT 'MENUNGGU',
  `completed_date` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `created_by_id` varchar(191) DEFAULT NULL,
  `customer_address` varchar(191) DEFAULT NULL,
  `customer_name` varchar(191) NOT NULL,
  `customer_phone` varchar(191) DEFAULT NULL,
  `design_image_url` varchar(191) DEFAULT NULL,
  `down_payment` decimal(14,2) DEFAULT NULL,
  `estimated_price` decimal(14,2) DEFAULT NULL,
  `final_price` decimal(14,2) DEFAULT NULL,
  `gold_color` varchar(191) NOT NULL,
  `gold_price_per_gram` decimal(14,2) DEFAULT NULL,
  `gold_type` varchar(191) NOT NULL,
  `item_type` varchar(191) NOT NULL,
  `notes` varchar(191) DEFAULT NULL,
  `pickup_date` datetime(3) DEFAULT NULL,
  `reference_image_urls` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`reference_image_urls`)),
  `updated_at` datetime(3) NOT NULL,
  `updated_by_id` varchar(191) DEFAULT NULL,
  `promised_ready_date` datetime(3) DEFAULT NULL,
  `stone_count` int(11) NOT NULL DEFAULT 0,
  `total_stone_weight` decimal(10,2) DEFAULT NULL,
  `ring_size` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Order_code_key` (`code`),
  KEY `Order_created_by_id_fkey` (`created_by_id`),
  KEY `Order_updated_by_id_fkey` (`updated_by_id`),
  CONSTRAINT `Order_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Order_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table sumatra_jewelry.orderhistory
CREATE TABLE IF NOT EXISTS `orderhistory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderId` int(11) NOT NULL,
  `changedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `userId` varchar(191) DEFAULT NULL,
  `changeSummary` varchar(191) DEFAULT NULL,
  `diff` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`diff`)),
  `action` enum('CREATED','UPDATED','STATUS_CHANGED','NOTE_ADDED','TASK_EVENT','DELETED') NOT NULL DEFAULT 'UPDATED',
  `actorName` varchar(191) DEFAULT NULL,
  `actorRole` enum('ADMINISTRATOR','SALES','DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY') DEFAULT NULL,
  `context` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`context`)),
  `field` varchar(191) DEFAULT NULL,
  `groupId` varchar(191) DEFAULT NULL,
  `next` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`next`)),
  `orderCode` varchar(191) DEFAULT NULL,
  `prev` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`prev`)),
  `snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`snapshot`)),
  `statusFrom` enum('MENUNGGU','DALAM_PROSES','SIAP','DIAMBIL','BATAL') DEFAULT NULL,
  `statusTo` enum('MENUNGGU','DALAM_PROSES','SIAP','DIAMBIL','BATAL') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `OrderHistory_orderId_changedAt_idx` (`orderId`,`changedAt`),
  KEY `OrderHistory_action_idx` (`action`),
  KEY `OrderHistory_field_idx` (`field`),
  KEY `OrderHistory_userId_idx` (`userId`),
  CONSTRAINT `OrderHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `OrderHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table sumatra_jewelry.orderstone
CREATE TABLE IF NOT EXISTS `orderstone` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderId` int(11) NOT NULL,
  `bentuk` varchar(191) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `berat` decimal(10,2) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `OrderStone_orderId_idx` (`orderId`),
  KEY `OrderStone_bentuk_idx` (`bentuk`),
  CONSTRAINT `OrderStone_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table sumatra_jewelry.ordertask
CREATE TABLE IF NOT EXISTS `ordertask` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderId` int(11) NOT NULL,
  `stage` varchar(191) DEFAULT NULL,
  `status` enum('OPEN','ASSIGNED','IN_PROGRESS','AWAITING_VALIDATION','DONE','CANCELLED') NOT NULL DEFAULT 'OPEN',
  `assigned_to_id` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `notes` varchar(191) DEFAULT NULL,
  `requested_done_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) NOT NULL,
  `validated_at` datetime(3) DEFAULT NULL,
  `validated_by_id` varchar(191) DEFAULT NULL,
  `job_role` enum('ADMINISTRATOR','SALES','DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY') DEFAULT NULL,
  `checked_at` datetime(3) DEFAULT NULL,
  `checked_by_id` varchar(191) DEFAULT NULL,
  `is_checked` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `OrderTask_orderId_idx` (`orderId`),
  KEY `OrderTask_assigned_to_id_idx` (`assigned_to_id`),
  KEY `OrderTask_validated_by_id_fkey` (`validated_by_id`),
  KEY `OrderTask_checked_by_id_fkey` (`checked_by_id`),
  CONSTRAINT `OrderTask_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `OrderTask_checked_by_id_fkey` FOREIGN KEY (`checked_by_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `OrderTask_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `OrderTask_validated_by_id_fkey` FOREIGN KEY (`validated_by_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table sumatra_jewelry._prisma_migrations
CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
