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

-- Dumping structure for table sumatra_jewelry.appuser
DROP TABLE IF EXISTS `appuser`;
CREATE TABLE IF NOT EXISTS `appuser` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `job_role` enum('ADMINISTRATOR','SALES','DESIGNER','CASTER','CARVER','DIAMOND_SETTER','FINISHER','INVENTORY') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `AppUser_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry.appuser: ~8 rows (approximately)
INSERT INTO `appuser` (`id`, `email`, `fullName`, `password`, `createdAt`, `job_role`) VALUES
	('0ee65c77-641d-496f-9388-2a84f2232615', 'finisher@tokomas.local', 'Ayu', '$argon2id$v=19$m=65536,t=3,p=4$m0OrXYIxeUhgABR2Bt+7zQ$qaAaUhY+L8jk5322mgq/V6asewDt/yAAhmC0GUBb7FE', '2025-09-17 06:27:50.097', 'FINISHER'),
	('468786c9-6b2f-4ce7-9779-0cfcd50b14eb', 'inventory@tokomas.local', 'Suk Mai D', '$argon2id$v=19$m=65536,t=3,p=4$iEFqzUEhjL623Vu16l8F2w$Lcdbo/CfnmAbx46Cz6XOzY3wVqXxmOQjw9Ovp1T1PxQ', '2025-09-17 06:27:50.147', 'INVENTORY'),
	('5a777bc1-b320-4314-bde0-328053ce6036', 'designer@tokomas.local', 'Elbert Wijaya', '$argon2id$v=19$m=65536,t=3,p=4$qq6fNgS0jSFeZcpoJixTCg$XRJQrQorUYzNqUeUTCj3QMtft9qjIRYAWw8A/3oyxzk', '2025-09-17 06:27:49.901', 'DESIGNER'),
	('6dc4f807-b52d-492b-91c1-686d621bc17f', 'caster@tokomas.local', 'Hanpin', '$argon2id$v=19$m=65536,t=3,p=4$MjZNB1z/gFJ+rcYAuSZoqA$L4gIFbVBvzUAQht3MmHkkY4C89zSytZXlJII6tK4v50', '2025-09-17 06:27:49.998', 'CASTER'),
	('c6d05a93-b5d1-4050-8c55-cb5c33ed1ee7', 'carver@tokomas.local', 'Acai', '$argon2id$v=19$m=65536,t=3,p=4$UnxsIPh7cJ7W5nGnyr9pnQ$4QcXKaxxHR8sXw7zSbTwIjOKJNrtxqw/dytac+syr20', '2025-09-17 06:27:49.948', 'CARVER'),
	('d88f4937-05f5-4950-9a0b-79a4cc6d6e33', 'admin@tokomas.local', 'Aceng', '$argon2id$v=19$m=65536,t=3,p=4$fz9xFlk4q9n7xgCxvMkg4g$iWVYw0QjZjMGMBl4dmS8f7JLBtZRJebNx/lJTiLxK8I', '2025-09-17 06:27:49.789', 'ADMINISTRATOR'),
	('ea914c3e-a6b3-4145-a4f8-a1debe43135e', 'diamond@tokomas.local', 'Yanti Atas', '$argon2id$v=19$m=65536,t=3,p=4$O0bZPi5Wen78e3XEwKgj3g$FtUzPmy0M+Qm6rHOAbSWIuMw/7f47arkNdc1n7nk4rM', '2025-09-17 06:27:50.048', 'DIAMOND_SETTER'),
	('fc65225c-d2a2-4741-a5c7-f05a0337722d', 'sales@tokomas.local', 'Yanti', '$argon2id$v=19$m=65536,t=3,p=4$7Q+RFv2cwTmv8l3+Yk7SXg$Ab+gCAxHUGavabvtbPGHWtWBQC7PwM2jYeClim8TUVA', '2025-09-17 06:27:49.851', 'SALES');

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
  CONSTRAINT `InventoryItem_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `appuser` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `InventoryItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `InventoryItem_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `appuser` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry.inventoryitem: ~0 rows (approximately)

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `Order_code_key` (`code`),
  KEY `Order_created_by_id_fkey` (`created_by_id`),
  KEY `Order_updated_by_id_fkey` (`updated_by_id`),
  CONSTRAINT `Order_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `appuser` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Order_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `appuser` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry.order: ~0 rows (approximately)

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
  CONSTRAINT `OrderHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `appuser` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry.orderhistory: ~0 rows (approximately)

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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry.orderstone: ~0 rows (approximately)

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
  KEY `OrderTask_validated_by_id_fkey` (`validated_by_id`),
  KEY `OrderTask_checked_by_id_fkey` (`checked_by_id`),
  KEY `OrderTask_assigned_to_id_idx` (`assigned_to_id`),
  CONSTRAINT `OrderTask_assigned_to_id_fkey` FOREIGN KEY (`assigned_to_id`) REFERENCES `appuser` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `OrderTask_checked_by_id_fkey` FOREIGN KEY (`checked_by_id`) REFERENCES `appuser` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `OrderTask_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `OrderTask_validated_by_id_fkey` FOREIGN KEY (`validated_by_id`) REFERENCES `appuser` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry.ordertask: ~0 rows (approximately)

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

-- Dumping data for table sumatra_jewelry._prisma_migrations: ~24 rows (approximately)
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
	('00f1ed10-19da-4a1f-9ece-1048e7df4d43', '3beef5e3637164a78f7919bb3278a64a8685587f2077069633c68870b7ec6bf2', '2025-09-15 09:06:57.982', '20250908160334_', NULL, NULL, '2025-09-15 09:06:57.837', 1),
	('0a689246-1bc2-4d66-9aa2-70e4f5434d50', '80ef64b926f9dd23c251879bf7a096275160245cf704f6d1afd8f14f900419db', '2025-09-15 09:06:56.162', '20250903112235_init', NULL, NULL, '2025-09-15 09:06:55.817', 1),
	('0edb7ea1-16bb-4efa-b7e9-7e91a67a019f', 'a69ca05e3ce50a71d3197efabeb090679ed4de0455887bdb76d514a978db6c8f', '2025-09-15 09:06:57.385', '20250908111050_add_order_tasks', NULL, NULL, '2025-09-15 09:06:57.129', 1),
	('1904513b-8f6a-4b5a-801f-13adbee691a9', '505450aac8703ac8d2b73d6fc2542c8938f6123343fd2e0ed78cd5c1e3539eda', '2025-09-15 09:06:56.928', '20250908070000_order_stone_indexes_and_summary', NULL, NULL, '2025-09-15 09:06:56.874', 1),
	('28b1e3f6-8806-471d-aaf5-9017ab43d9c4', '7a969a4b0ee33eea54ea73740de9885ccacd48e5be73168a99f824f50a5d28e1', '2025-09-15 09:06:58.544', '20250915090525_', NULL, NULL, '2025-09-15 09:06:58.486', 1),
	('52b2071a-8ed8-441f-ac6f-9e8931699e77', '1f6fc0b6dba2d18eb87904e4541e81c5df9c495b24eeb9ec54fcdf512d33bd78', '2025-09-15 09:06:58.038', '20250908163313_', NULL, NULL, '2025-09-15 09:06:57.986', 1),
	('54a1c9cb-117e-4ae3-b16b-1cebb40fc6b1', '42b976dee4e81bddb03404c00feaaa26dde7a7bcd352bcad95e5d758c0b880cf', '2025-09-15 09:06:58.167', '20250915051632_add_task_checklist', NULL, NULL, '2025-09-15 09:06:58.042', 1),
	('6158ea7a-68d4-46a0-b3da-8a170410ef82', '11255bc68a424926908de4c7de9886ba62a3fed4d97c9c221c49cb75ac81ce7d', '2025-09-15 09:06:58.472', '20250915085516_', NULL, NULL, '2025-09-15 09:06:58.172', 1),
	('6e85e155-e9b6-48c8-86c1-fca21febc629', '9a6964649d345e7ea17a705f7ef75dd1e56610c5e953fc54f0c7d7f3f2a975b0', '2025-09-23 04:37:18.972', '20250923043523_orderhistory_rich_audit', '', NULL, '2025-09-23 04:37:18.972', 0),
	('6f13edd5-dd43-4807-a6f9-db3a6b94032b', 'f959cd4d745e45a46eba9c540390233f1b9eefb05ba6666eeccde8f88eb8992d', '2025-09-15 09:06:56.302', '20250903133411_extend_order_fields', NULL, NULL, '2025-09-15 09:06:56.166', 1),
	('7c232db2-5e24-4ffc-85e1-89ba6922cb85', 'e92f69999320a232ea759095f6be593203b2ce7420f2d4680a86e8e28de3ac49', '2025-09-15 09:06:57.116', '20250908080000_drop_final_weight_and_dp_nullable', NULL, NULL, '2025-09-15 09:06:56.990', 1),
	('7f9eb842-d1a4-4126-8670-19b72c4d10ce', '192e84e71a2fcbfd3a17b62f4a77433a666cd23f9a0a9a1eb5f9fdeca79cfa16', '2025-09-15 09:06:58.483', '20250915090438_', NULL, NULL, '2025-09-15 09:06:58.476', 1),
	('81be6e31-b83b-4885-8abb-38932710499a', '3a003b2840584cd0d9c3d10429d1c9e3476dcd727277eac1de21466cdaf8df8d', '2025-09-15 09:06:56.356', '20250903145107_add_multiple_images', NULL, NULL, '2025-09-15 09:06:56.306', 1),
	('843e5ac4-2cba-487b-a421-e088011bef34', 'dbbc01d1e2361bbd246a5238a98f1a3f3779d3b7dbb33d5dfb6ae561e000e0c3', NULL, '20250923043523_orderhistory_rich_audit', 'A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250923043523_orderhistory_rich_audit\n\nDatabase error code: 1091\n\nDatabase error:\nCan\'t DROP INDEX `OrderHistory_userId_fkey`; check that it exists\n\nPlease check the query number 6 from the migration file.\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250923043523_orderhistory_rich_audit"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20250923043523_orderhistory_rich_audit"\n             at schema-engine\\core\\src\\commands\\apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:226', '2025-09-23 04:37:18.966', '2025-09-23 04:35:23.817', 0),
	('9cc7ba65-92ce-4ce6-aa0c-40ace8e2a84a', 'b8a50838cf002e65525ad5af725fb6ef89733fe9dba2ebd4691b153b8a0d0f94', '2025-09-15 09:06:57.833', '20250908151733_add_user_job_role', NULL, NULL, '2025-09-15 09:06:57.785', 1),
	('9ff93804-aeb7-4e81-b840-ec6e3e09ce9b', '13e2d3bef2445dae3140e430efe1dee6e3ded6b4fea906b463ad0d3ac06be1ca', '2025-09-15 09:06:57.126', '20250908090000_tasks_assignment_and_requests', NULL, NULL, '2025-09-15 09:06:57.119', 1),
	('a3c50286-d75d-4a11-992f-6f34f45ac54f', 'c9d303ee5f818c947a0a5b6fb5f3dedf1e8bf54833939f917edde41260868905', '2025-09-15 09:06:56.987', '20250908074114_order_stone_indexes_and_summary', NULL, NULL, '2025-09-15 09:06:56.932', 1),
	('a59d30cc-269d-43c0-b0a8-b370ed5655ce', '1ba9f6fe6fa37be315b95d4a7b3c85024c57ef6846f974335a78318a5bf425e6', '2025-09-15 09:06:56.752', '20250903161757_rename_promised_ready_date', NULL, NULL, '2025-09-15 09:06:56.697', 1),
	('abb30afd-6d48-4349-be1a-1539db0ef534', '14574a67d770271e2005678af92ff5e199f7b83b6353814b7f20b8d4a42119c8', '2025-09-15 09:06:56.870', '20250903162432_drop_single_reference_image_url', NULL, NULL, '2025-09-15 09:06:56.814', 1),
	('b091da20-26a0-43f8-b46d-00b2ad1bf8dd', '884f7ceb605b89ffc599a24f9d2774d0c5890b5973c2843dbf13e053d2b5bcde', '2025-09-15 09:06:56.411', '20250903153139_drop_legacy_kadar_berat_target', NULL, NULL, '2025-09-15 09:06:56.360', 1),
	('c9ff0be2-6b21-485d-8db1-91e0230939f1', 'fb8ee026963b5b62556c74fd97fccb39b2643484a7c9c95eb556a238051fa3e8', '2025-09-15 09:06:56.810', '20250903161943_drop_ongkos_column', NULL, NULL, '2025-09-15 09:06:56.756', 1),
	('e5b7c655-bcc4-45f3-b26d-6deba4549ae3', '2c264520a996df132ea47f63619e6d269d1288d4119c8c74377e9f9f9b790211', '2025-09-15 09:06:57.730', '20250908112503_', NULL, NULL, '2025-09-15 09:06:57.389', 1),
	('e7d88a86-66f3-4377-b6d2-40b53f2614b2', 'de889cfa2c937541ecf91aad32acbf9040e32968fbdcdcde905b98782ad75180', '2025-09-15 09:06:57.781', '20250908145850_add_task_job_role', NULL, NULL, '2025-09-15 09:06:57.734', 1),
	('f3ff2569-0ad0-4fef-8040-11f2cbfa7cc5', '554c315091eaf9b4f76337e5003cf4fbf0bbee65d6ccbfe236326977336d798b', '2025-09-15 09:06:56.694', '20250903153633_snake_case_order_fields', NULL, NULL, '2025-09-15 09:06:56.415', 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
