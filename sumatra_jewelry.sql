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
DROP DATABASE IF EXISTS `sumatra_jewelry`;
CREATE DATABASE IF NOT EXISTS `sumatra_jewelry` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `sumatra_jewelry`;

-- Dumping structure for table sumatra_jewelry.account
DROP TABLE IF EXISTS `account`;
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

-- Dumping data for table sumatra_jewelry.account: ~8 rows (approximately)
DELETE FROM `account`;
INSERT INTO `account` (`id`, `email`, `fullName`, `job_role`, `password`, `branch_id`, `phone`, `address`, `created_at`) VALUES
	('33639b95-bdc7-49e0-971c-38189f625c91', 'designer@tokomas.local', 'Elbert Wijaya', 'DESIGNER', '$argon2id$v=19$m=65536,t=3,p=4$Ncppp1NWP3zuvd2L+qbHUg$Vk48NQ5wLdP9Ae3dBiicFNYIR5tCMVA7IpZLLGS3G58', 2, '081234567891', 'Jl. Sun Plaza', '2025-10-23 06:49:47.284'),
	('40290c76-4185-43f5-a91a-83429efde1d1', 'carver@tokomas.local', 'Acai', 'CARVER', '$argon2id$v=19$m=65536,t=3,p=4$LMDNix9cSVS47Tk+bg+reg$jRIhF9OvTUx131mm/ZHPsahWq+10zOvR5P96mdJOi1s', 1, '081234567892', 'Jl. Asia No.170 B', '2025-10-23 06:49:47.343'),
	('523aca04-13fa-48ae-9a74-096567641d7c', 'inventory@tokomas.local', 'Suk Mai D', 'INVENTORY', '$argon2id$v=19$m=65536,t=3,p=4$dbA8cOGCUzbgumQCF+7oTQ$B1qY/vzn88p0G2ZQmQxG1fePJ+cLa9tGCSBtzDrlZwc', 1, '081234567896', 'Jl. Asia No.170 B', '2025-10-23 06:49:47.572'),
	('7f200bfd-29bc-487b-9a3f-2cdc695dc38a', 'finisher@tokomas.local', 'Ayu', 'FINISHER', '$argon2id$v=19$m=65536,t=3,p=4$OTgRktCbCxPSeETKrsRF6w$cYsg9Yv6gIvIFY6RIOQnsUpvtj4VB46dBy1ywVi0c98', 2, '081234567895', 'Jl. Sun Plaza', '2025-10-23 06:49:47.518'),
	('92e1d754-ab56-4c29-abfa-88f4d36ca753', 'diamond@tokomas.local', 'Yanti Atas', 'DIAMOND_SETTER', '$argon2id$v=19$m=65536,t=3,p=4$6cTSt8xoCEE5v0paO6X9uQ$J7uc5BIm4bCNgZtFGKK+kR/bZ/Qs+m2NQZL88B3oKKk', 1, '081234567894', 'Jl. Asia No.170 B', '2025-10-23 06:49:47.461'),
	('be0f8f2b-8164-4d75-8242-e628c31963fd', 'admin@tokomas.local', 'Aceng', 'ADMINISTRATOR', '$argon2id$v=19$m=65536,t=3,p=4$5ahRMtjlBeH6CB/6xOYFHg$dS9tzlm+30PzUr/kUftPLKvSpwzQFi0NYlX3RDz6U4w', 1, NULL, NULL, '2025-10-23 06:49:47.159'),
	('cbd96a29-15a6-4817-8557-e3a870c5a76f', 'sales@tokomas.local', 'Yanti', 'SALES', '$argon2id$v=19$m=65536,t=3,p=4$ZrdBDKVzJav+HbZDcpYbmg$FIXwBSOW6oFR89/MdV+bYAMzdgbkmzzTQw0SwSb0dSY', 1, '08123456789555', 'Pasar Baru', '2025-10-23 06:49:47.223'),
	('d61ef5ce-360f-41ae-af37-ef020d5354e1', 'caster@tokomas.local', 'Hanpin', 'CASTER', '$argon2id$v=19$m=65536,t=3,p=4$QrV4bHdd+dmg+S+WqZBa5g$nBElhb7oqE3/WPIIeLXKZur5elDeLKajPqQbh80QoPg', 2, '081234567893', 'Jl. Sun Plaza', '2025-10-23 06:49:47.403');

-- Dumping structure for table sumatra_jewelry.branch
DROP TABLE IF EXISTS `branch`;
CREATE TABLE IF NOT EXISTS `branch` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `address` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry.branch: ~2 rows (approximately)
DELETE FROM `branch`;
INSERT INTO `branch` (`id`, `name`, `address`) VALUES
	(1, 'Asia', 'Jl. Asia No.170 B, Sei Rengas II, Kec. Medan Area, Kota Medan, Sumatera Utara 20211'),
	(2, 'Sun Plaza', 'Mall Jl. KH. Zainul Arifin No.7, Madras Hulu, Kec. Medan Polonia, Kota Medan, Sumatera Utara 20152');

-- Dumping structure for table sumatra_jewelry.inventoryitem
DROP TABLE IF EXISTS `inventoryitem`;
CREATE TABLE IF NOT EXISTS `inventoryitem` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderId` int(11) DEFAULT NULL,
  `code` varchar(191) DEFAULT NULL,
  `name` varchar(191) DEFAULT NULL,
  `category` varchar(191) DEFAULT NULL,
  `material` varchar(191) DEFAULT NULL,
  `karat` varchar(191) DEFAULT NULL,
  `gold_type` varchar(191) DEFAULT NULL,
  `gold_color` varchar(191) DEFAULT NULL,
  `weight_gross` decimal(10,2) DEFAULT NULL,
  `weight_net` decimal(10,2) DEFAULT NULL,
  `stone_count` int(11) DEFAULT NULL,
  `stone_weight` decimal(10,2) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `dimensions` varchar(191) DEFAULT NULL,
  `barcode` varchar(191) DEFAULT NULL,
  `sku` varchar(191) DEFAULT NULL,
  `location` varchar(191) DEFAULT NULL,
  `cost` decimal(14,2) DEFAULT NULL,
  `price` decimal(14,2) DEFAULT NULL,
  `status` varchar(191) DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `notes` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `created_by_id` varchar(191) DEFAULT NULL,
  `updated_by_id` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `InventoryItem_barcode_key` (`barcode`),
  UNIQUE KEY `InventoryItem_sku_key` (`sku`),
  KEY `InventoryItem_orderId_idx` (`orderId`),
  KEY `InventoryItem_barcode_idx` (`barcode`),
  KEY `InventoryItem_sku_idx` (`sku`),
  KEY `InventoryItem_created_by_id_fkey` (`created_by_id`),
  KEY `InventoryItem_updated_by_id_fkey` (`updated_by_id`),
  CONSTRAINT `InventoryItem_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `InventoryItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `InventoryItem_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry.inventoryitem: ~0 rows (approximately)
DELETE FROM `inventoryitem`;

-- Dumping structure for table sumatra_jewelry.order
DROP TABLE IF EXISTS `order`;
CREATE TABLE IF NOT EXISTS `order` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(191) DEFAULT NULL,
  `status` enum('DRAFT','DITERIMA','DALAM_PROSES','SIAP','DIAMBIL','BATAL') NOT NULL DEFAULT 'DRAFT',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry.order: ~0 rows (approximately)
DELETE FROM `order`;

-- Dumping structure for table sumatra_jewelry.orderhistory
DROP TABLE IF EXISTS `orderhistory`;
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
  `statusFrom` enum('DRAFT','DITERIMA','DALAM_PROSES','SIAP','DIAMBIL','BATAL') DEFAULT NULL,
  `statusTo` enum('DRAFT','DITERIMA','DALAM_PROSES','SIAP','DIAMBIL','BATAL') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `OrderHistory_orderId_changedAt_idx` (`orderId`,`changedAt`),
  KEY `OrderHistory_action_idx` (`action`),
  KEY `OrderHistory_field_idx` (`field`),
  KEY `OrderHistory_userId_idx` (`userId`),
  CONSTRAINT `OrderHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `OrderHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry.orderhistory: ~0 rows (approximately)
DELETE FROM `orderhistory`;

-- Dumping structure for table sumatra_jewelry.orderstone
DROP TABLE IF EXISTS `orderstone`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry.orderstone: ~0 rows (approximately)
DELETE FROM `orderstone`;

-- Dumping structure for table sumatra_jewelry.ordertask
DROP TABLE IF EXISTS `ordertask`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry.ordertask: ~0 rows (approximately)
DELETE FROM `ordertask`;

-- Dumping structure for table sumatra_jewelry._prisma_migrations
DROP TABLE IF EXISTS `_prisma_migrations`;
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

-- Dumping data for table sumatra_jewelry._prisma_migrations: ~27 rows (approximately)
DELETE FROM `_prisma_migrations`;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
	('01591da7-d3c6-4a97-903f-9a2241369f75', 'fcc00eb3eda2f1914c340bcce5835bda855aa9cd6c24acfda923290fd422940e', '2025-10-23 06:17:42.784', '20251023061741_', NULL, NULL, '2025-10-23 06:17:41.815', 1),
	('1a6c3e05-6561-4fab-86ca-61784469a21f', '884f7ceb605b89ffc599a24f9d2774d0c5890b5973c2843dbf13e053d2b5bcde', '2025-10-23 06:17:18.726', '20250903153139_drop_legacy_kadar_berat_target', NULL, NULL, '2025-10-23 06:17:18.677', 1),
	('227e8973-2d0f-48e8-b105-ea660253b355', '14574a67d770271e2005678af92ff5e199f7b83b6353814b7f20b8d4a42119c8', '2025-10-23 06:17:19.142', '20250903162432_drop_single_reference_image_url', NULL, NULL, '2025-10-23 06:17:19.093', 1),
	('23342354-4d3e-432f-8393-074f213c7e3a', '6bd9e40875ffebc833b70d7608bd4f01325297341563ebfca810ab05697bb638', '2025-10-23 06:17:20.969', '20250930064155_add_ring_size', NULL, NULL, '2025-10-23 06:17:20.923', 1),
	('29c48109-eacf-4748-b3b4-d07c7998187c', '3a003b2840584cd0d9c3d10429d1c9e3476dcd727277eac1de21466cdaf8df8d', '2025-10-23 06:17:18.673', '20250903145107_add_multiple_images', NULL, NULL, '2025-10-23 06:17:18.629', 1),
	('41e9bd4a-3320-4aa4-8876-81b56ca5195e', '1f6fc0b6dba2d18eb87904e4541e81c5df9c495b24eeb9ec54fcdf512d33bd78', '2025-10-23 06:17:20.207', '20250908163313_', NULL, NULL, '2025-10-23 06:17:20.157', 1),
	('4d28ca09-216e-4fc1-80ba-4f138c6e33ab', 'e92f69999320a232ea759095f6be593203b2ce7420f2d4680a86e8e28de3ac49', '2025-10-23 06:17:19.372', '20250908080000_drop_final_weight_and_dp_nullable', NULL, NULL, '2025-10-23 06:17:19.257', 1),
	('4e10d65c-8b13-4eca-a52b-86cb9e1b35d5', '505450aac8703ac8d2b73d6fc2542c8938f6123343fd2e0ed78cd5c1e3539eda', '2025-10-23 06:17:19.196', '20250908070000_order_stone_indexes_and_summary', NULL, NULL, '2025-10-23 06:17:19.145', 1),
	('5859c9b4-d745-4f93-bbb3-a77e3d88cbae', '3ccdea592a8c0e2c9b819666b4dfbb87f6c3e6476a61e0694170d95ba85bfcb2', '2025-10-23 06:17:20.614', '20250915090438_', NULL, NULL, '2025-10-23 06:17:20.608', 1),
	('5f72fe40-8f65-4509-b66e-41cbb57a2fee', 'de889cfa2c937541ecf91aad32acbf9040e32968fbdcdcde905b98782ad75180', '2025-10-23 06:17:19.973', '20250908145850_add_task_job_role', NULL, NULL, '2025-10-23 06:17:19.927', 1),
	('60f713fb-ca41-4859-98a0-297ff5fcb004', 'b8a50838cf002e65525ad5af725fb6ef89733fe9dba2ebd4691b153b8a0d0f94', '2025-10-23 06:17:20.022', '20250908151733_add_user_job_role', NULL, NULL, '2025-10-23 06:17:19.976', 1),
	('66a8d5ea-4275-4a2f-89b9-1e17cd46f5f4', '80ef64b926f9dd23c251879bf7a096275160245cf704f6d1afd8f14f900419db', '2025-10-23 06:17:18.488', '20250903112235_init', NULL, NULL, '2025-10-23 06:17:18.173', 1),
	('768ddec0-8ffc-4735-a642-2f1e9f3aa8e4', '394e1c986f4bc2bed1d0da27fb913493cc2b45570f7cc9e891f57a8ff054d33b', '2025-10-23 06:17:21.022', '20251022090526_add_avatar_column', NULL, NULL, '2025-10-23 06:17:20.973', 1),
	('7d669dcc-c7f1-4ead-a0f7-1cd57023bc99', '3beef5e3637164a78f7919bb3278a64a8685587f2077069633c68870b7ec6bf2', '2025-10-23 06:17:20.154', '20250908160334_', NULL, NULL, '2025-10-23 06:17:20.025', 1),
	('7e3e986b-6d32-479c-816c-6d7d4c04b457', 'c43c69d836759cd781457ef7ceb9d212e213a3bccdde1f2e2f018d30f8301bf9', '2025-10-23 06:17:20.325', '20250915051632_add_task_checklist', NULL, NULL, '2025-10-23 06:17:20.210', 1),
	('83a23e17-0978-4b97-8db3-8857c3e7104a', '13e2d3bef2445dae3140e430efe1dee6e3ded6b4fea906b463ad0d3ac06be1ca', '2025-10-23 06:17:19.381', '20250908090000_tasks_assignment_and_requests', NULL, NULL, '2025-10-23 06:17:19.375', 1),
	('9cdcfc3b-61ee-4ef8-b32b-a927f65a9539', 'daaeecb48b816ad1a1b68e54427827178afef143e0e244d9ad2e85076da9c82e', '2025-10-23 06:17:20.605', '20250915085516_', NULL, NULL, '2025-10-23 06:17:20.328', 1),
	('9d796efa-b352-4fbc-bd2b-3f9a8dd530f6', '554c315091eaf9b4f76337e5003cf4fbf0bbee65d6ccbfe236326977336d798b', '2025-10-23 06:17:18.983', '20250903153633_snake_case_order_fields', NULL, NULL, '2025-10-23 06:17:18.730', 1),
	('a1361f7a-0ff1-45e9-80fc-7f4daa295637', '10f2b7f17643691a5f6734c91921061231058ae69eee966b431f387d173fce80', '2025-10-23 06:17:21.139', '20251023053414_init_account_branch', NULL, NULL, '2025-10-23 06:17:21.025', 1),
	('bfa57366-91d8-405e-b7c4-24714cf56e83', 'c9d303ee5f818c947a0a5b6fb5f3dedf1e8bf54833939f917edde41260868905', '2025-10-23 06:17:19.254', '20250908074114_order_stone_indexes_and_summary', NULL, NULL, '2025-10-23 06:17:19.199', 1),
	('c86419ba-af59-44ef-ad90-4f9e51b6a13d', '9a6964649d345e7ea17a705f7ef75dd1e56610c5e953fc54f0c7d7f3f2a975b0', '2025-10-23 06:17:20.920', '20250923043523_orderhistory_rich_audit', NULL, NULL, '2025-10-23 06:17:20.677', 1),
	('d09c8680-5af5-480e-a31d-310a8744cf80', 'f959cd4d745e45a46eba9c540390233f1b9eefb05ba6666eeccde8f88eb8992d', '2025-10-23 06:17:18.625', '20250903133411_extend_order_fields', NULL, NULL, '2025-10-23 06:17:18.491', 1),
	('d543f45e-1ba2-4087-b8e0-77d10d143032', 'acbcc5f5f98ff21501f9d32d5b1e5823579e6427f60638e64805e19a14c568a8', '2025-10-23 06:17:20.673', '20250915090525_', NULL, NULL, '2025-10-23 06:17:20.617', 1),
	('e59cf2d3-e567-47f7-9872-d5e9892a975b', 'a69ca05e3ce50a71d3197efabeb090679ed4de0455887bdb76d514a978db6c8f', '2025-10-23 06:17:19.617', '20250908111050_add_order_tasks', NULL, NULL, '2025-10-23 06:17:19.384', 1),
	('e62376d9-2f37-4bbd-86e1-36fa91d92286', '1ba9f6fe6fa37be315b95d4a7b3c85024c57ef6846f974335a78318a5bf425e6', '2025-10-23 06:17:19.036', '20250903161757_rename_promised_ready_date', NULL, NULL, '2025-10-23 06:17:18.987', 1),
	('e80173bc-271f-4514-a47e-40d62b893ac0', 'fb8ee026963b5b62556c74fd97fccb39b2643484a7c9c95eb556a238051fa3e8', '2025-10-23 06:17:19.089', '20250903161943_drop_ongkos_column', NULL, NULL, '2025-10-23 06:17:19.039', 1),
	('fc5f8822-bc7d-4d58-b7e7-a9c51cc468c5', '2c264520a996df132ea47f63619e6d269d1288d4119c8c74377e9f9f9b790211', '2025-10-23 06:17:19.924', '20250908112503_', NULL, NULL, '2025-10-23 06:17:19.620', 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
