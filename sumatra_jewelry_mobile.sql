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


-- Dumping database structure for sumatra_jewelry_mobile
DROP DATABASE IF EXISTS `sumatra_jewelry_mobile`;
CREATE DATABASE IF NOT EXISTS `sumatra_jewelry_mobile_mobile` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `sumatra_jewelry_mobile_mobile`;

-- Dumping structure for table sumatra_jewelry_mobile.account
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

-- Dumping data for table sumatra_jewelry_mobile.account: ~8 rows (approximately)
DELETE FROM `account`;
INSERT INTO `account` (`id`, `email`, `fullName`, `job_role`, `password`, `branch_id`, `phone`, `address`, `created_at`) VALUES
	('02f67fce-ff6f-4657-9169-665156ef8833', 'carver@tokomas.local', 'Alim', 'CARVER', '$argon2id$v=19$m=65536,t=3,p=4$er/XS/VWs9I4BaJYjtpXQg$nwfOmfa5+BygxDvg+DrHMCt9g0iigUfPJIInp0IHIds', 1, NULL, NULL, '2025-11-20 07:25:59.063'),
	('2af408fa-ab2a-4db2-a2b6-931837c49f61', 'caster@tokomas.local', 'Saipe', 'CASTER', '$argon2id$v=19$m=65536,t=3,p=4$er/XS/VWs9I4BaJYjtpXQg$nwfOmfa5+BygxDvg+DrHMCt9g0iigUfPJIInp0IHIds', 1, NULL, NULL, '2025-11-20 07:25:59.058'),
	('6d3f1476-f726-4ebb-80c7-8adf4d2c7e7f', 'diamond_setter@tokomas.local', 'Diamond Setter', 'DIAMOND_SETTER', '$argon2id$v=19$m=65536,t=3,p=4$er/XS/VWs9I4BaJYjtpXQg$nwfOmfa5+BygxDvg+DrHMCt9g0iigUfPJIInp0IHIds', 1, NULL, NULL, '2025-11-20 07:25:59.068'),
	('71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'sales@tokomas.local', 'Sales', 'SALES', '$argon2id$v=19$m=65536,t=3,p=4$er/XS/VWs9I4BaJYjtpXQg$nwfOmfa5+BygxDvg+DrHMCt9g0iigUfPJIInp0IHIds', 1, NULL, NULL, '2025-11-20 07:25:59.048'),
	('8afc40d9-8419-42ce-ab7f-69b71dd33c90', 'finisher@tokomas.local', 'Finisher', 'FINISHER', '$argon2id$v=19$m=65536,t=3,p=4$er/XS/VWs9I4BaJYjtpXQg$nwfOmfa5+BygxDvg+DrHMCt9g0iigUfPJIInp0IHIds', 1, NULL, NULL, '2025-11-20 07:25:59.073'),
	('b041ff84-975b-4ec4-a1ff-bd91cd6057e5', 'administrator@tokomas.local', 'Administrator', 'ADMINISTRATOR', '$argon2id$v=19$m=65536,t=3,p=4$er/XS/VWs9I4BaJYjtpXQg$nwfOmfa5+BygxDvg+DrHMCt9g0iigUfPJIInp0IHIds', 1, NULL, NULL, '2025-11-20 07:25:59.040'),
	('c741c349-a7ad-47c2-86f8-e7ab63f06716', 'designer@tokomas.local', 'Elbert Wijaya', 'DESIGNER', '$argon2id$v=19$m=65536,t=3,p=4$er/XS/VWs9I4BaJYjtpXQg$nwfOmfa5+BygxDvg+DrHMCt9g0iigUfPJIInp0IHIds', 1, NULL, NULL, '2025-11-20 07:25:59.053'),
	('f1f7db96-af10-4749-a8a7-fe6552872104', 'inventory@tokomas.local', 'Inventory', 'INVENTORY', '$argon2id$v=19$m=65536,t=3,p=4$er/XS/VWs9I4BaJYjtpXQg$nwfOmfa5+BygxDvg+DrHMCt9g0iigUfPJIInp0IHIds', 1, NULL, NULL, '2025-11-20 07:25:59.078');

-- Dumping structure for table sumatra_jewelry_mobile.branch
DROP TABLE IF EXISTS `branch`;
CREATE TABLE IF NOT EXISTS `branch` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `address` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry_mobile.branch: ~2 rows (approximately)
DELETE FROM `branch`;
INSERT INTO `branch` (`id`, `name`, `address`) VALUES
	(1, 'ASIA', 'ASIA Branch'),
	(2, 'SUN_PLAZA', 'SUN PLAZA Branch');

-- Dumping structure for table sumatra_jewelry_mobile.inventoryitem
DROP TABLE IF EXISTS `inventoryitem`;
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

-- Dumping data for table sumatra_jewelry_mobile.inventoryitem: ~1 rows (approximately)
DELETE FROM `inventoryitem`;
INSERT INTO `inventoryitem` (`id`, `orderId`, `code`, `name`, `category`, `gold_type`, `gold_color`, `weight_gross`, `weight_net`, `stone_count`, `stone_weight`, `dimensions`, `barcode`, `sku`, `branch_location`, `placement_location`, `cost`, `price`, `status`, `images`, `created_at`, `updated_at`, `created_by_id`, `updated_by_id`, `status_enum`, `deleted_at`, `is_deleted`, `ring_size`) VALUES
	(3, NULL, 'WP163', 'Pendant Pear Jamrud', 'Pendant', '18K', 'White Gold', NULL, 4.35, 31, 1.11, '[{"bentuk":"Round","jumlah":"30","berat":"0.25"},{"bentuk":"Round","jumlah":"1","berat":"0.864"}]', NULL, NULL, 'ASIA', 'PENYIMPANAN', NULL, NULL, NULL, '["/uploads/1764394925100-640655740.jpeg"]', '2025-11-29 05:42:08.213', '2025-11-29 06:29:02.028', 'f1f7db96-af10-4749-a8a7-fe6552872104', 'f1f7db96-af10-4749-a8a7-fe6552872104', 'ACTIVE', NULL, 0, NULL);

-- Dumping structure for table sumatra_jewelry_mobile.inventoryitemhistory
DROP TABLE IF EXISTS `inventoryitemhistory`;
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

-- Dumping data for table sumatra_jewelry_mobile.inventoryitemhistory: ~0 rows (approximately)
DELETE FROM `inventoryitemhistory`;

-- Dumping structure for table sumatra_jewelry_mobile.inventorystone
DROP TABLE IF EXISTS `inventorystone`;
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

-- Dumping data for table sumatra_jewelry_mobile.inventorystone: ~2 rows (approximately)
DELETE FROM `inventorystone`;
INSERT INTO `inventorystone` (`id`, `inventoryItemId`, `bentuk`, `jumlah`, `berat`, `created_at`) VALUES
	(9, 3, 'Round', 30, 0.25, '2025-11-29 06:29:02.030'),
	(10, 3, 'Round', 1, 0.86, '2025-11-29 06:29:02.030');

-- Dumping structure for table sumatra_jewelry_mobile.order
DROP TABLE IF EXISTS `order`;
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry_mobile.order: ~7 rows (approximately)
DELETE FROM `order`;
INSERT INTO `order` (`id`, `code`, `status`, `completed_date`, `created_at`, `created_by_id`, `customer_address`, `customer_name`, `customer_phone`, `design_image_url`, `down_payment`, `estimated_price`, `final_price`, `gold_color`, `gold_price_per_gram`, `gold_type`, `item_type`, `notes`, `pickup_date`, `reference_image_urls`, `updated_at`, `updated_by_id`, `promised_ready_date`, `stone_count`, `total_stone_weight`, `ring_size`) VALUES
	(9, 'TM-202512-0009', 'DALAM_PROSES', NULL, '2025-11-15 07:48:56.770', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'Asia', 'Toko', '-', NULL, NULL, NULL, NULL, 'White Gold', NULL, '9K', 'Pendant', NULL, NULL, '["/uploads/1764747930083-178545594.jpg","/uploads/1764747966138-162378169.jpg","/uploads/1764747987324-537046618.jpg","/uploads/1764748009055-844722804.jpg","/uploads/1764748025716-633355612.jpg"]', '2025-12-03 07:48:56.762', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', '2025-12-10 00:00:00.000', 0, NULL, NULL),
	(10, 'TM-202512-0010', 'DALAM_PROSES', NULL, '2025-11-03 10:46:05.092', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', NULL, 'Sisi Ai', NULL, NULL, NULL, NULL, NULL, 'White Gold', NULL, '18K', 'Women Ring', 'Tempahan 1 cincin cewek batu Ruby', NULL, '["/uploads/RedRuby_Sapphire.jpg"]', '2025-12-05 03:46:05.088', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', NULL, 0, NULL, '9'),
	(11, 'TM-202512-0011', 'DALAM_PROSES', NULL, '2025-12-03 09:50:48.460', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', NULL, 'Aliong', NULL, NULL, NULL, NULL, NULL, 'Yellow Gold', NULL, '16K', 'Pendant', 'Mainan Huruf balok, berlian N', NULL, '["/uploads/WhatsApp Image 2025-12-03 at 12.20.24.jpeg", "/uploads/WhatsApp Image 2025-12-03 at 12.46.51.jpeg"]', '2025-12-05 03:49:48.458', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', NULL, 0, NULL, NULL),
	(12, 'TM-202512-0012', 'DALAM_PROSES', NULL, '2025-12-05 03:57:48.977', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', NULL, 'Customer 1', NULL, NULL, NULL, NULL, NULL, 'Yellow Gold', NULL, '16K', 'Men Ring', 'Cincin batu yellow sapphire sesuai contoh', NULL, NULL, '2025-12-05 03:57:48.975', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', NULL, 8, 0.03, '18'),
	(14, 'TM-202512-0014', 'DALAM_PROSES', NULL, '2025-12-20 03:47:48.899', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', NULL, 'Asia', NULL, NULL, NULL, NULL, NULL, 'White Gold', NULL, '18K', 'Earring', 'Dibuat seperti contoh', NULL, '["/uploads/1766202443160-535543415.jpeg"]', '2025-12-20 03:47:48.898', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', NULL, 1, 0.25, NULL),
	(15, 'TM-202512-0015', 'MENUNGGU', NULL, '2025-12-20 03:56:26.954', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', NULL, 'Acin Cc', NULL, NULL, NULL, NULL, NULL, 'White Gold', NULL, '18K', 'Earring', 'Buat mata satunya saja ukuran 0.10ct per bijinya. Panjangnya sesuaikan', NULL, '["/uploads/1766202902389-139529401.jpeg"]', '2025-12-20 03:56:26.952', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', NULL, 0, NULL, NULL),
	(16, 'TM-202512-0016', 'DALAM_PROSES', NULL, '2025-12-29 02:59:04.691', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', NULL, 'Vivi ', '08126015156', NULL, NULL, NULL, NULL, 'White Gold', NULL, '18K', 'Women Ring', 'Buat sperti contoh', NULL, '["/uploads/1766977013263-972716015.jpeg","/uploads/1766977027434-703135628.jpeg","/uploads/1766977045213-311097146.jpeg"]', '2025-12-29 02:59:04.689', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', '2026-01-08 00:00:00.000', 0, NULL, '16');

-- Dumping structure for table sumatra_jewelry_mobile.orderhistory
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
  `statusFrom` enum('MENUNGGU','DALAM_PROSES','SIAP','DIAMBIL','BATAL') DEFAULT NULL,
  `statusTo` enum('MENUNGGU','DALAM_PROSES','SIAP','DIAMBIL','BATAL') DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `OrderHistory_orderId_changedAt_idx` (`orderId`,`changedAt`),
  KEY `OrderHistory_action_idx` (`action`),
  KEY `OrderHistory_field_idx` (`field`),
  KEY `OrderHistory_userId_idx` (`userId`),
  CONSTRAINT `OrderHistory_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `OrderHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry_mobile.orderhistory: ~23 rows (approximately)
DELETE FROM `orderhistory`;
INSERT INTO `orderhistory` (`id`, `orderId`, `changedAt`, `userId`, `changeSummary`, `diff`, `action`, `actorName`, `actorRole`, `context`, `field`, `groupId`, `next`, `orderCode`, `prev`, `snapshot`, `statusFrom`, `statusTo`) VALUES
	(40, 9, '2025-12-03 07:48:56.802', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'CREATE ORDER', NULL, 'CREATED', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0009', NULL, NULL, NULL, NULL),
	(41, 9, '2025-12-03 07:52:09.868', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'STATUS: MENUNGGU -> DALAM_PROSES', '{"from":"MENUNGGU","to":"DALAM_PROSES"}', 'STATUS_CHANGED', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0009', NULL, NULL, 'MENUNGGU', 'DALAM_PROSES'),
	(42, 9, '2025-12-03 07:53:02.909', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', 'TASKS_REQUESTED_VALIDATION user=c741c349-a7ad-47c2-86f8-e7ab63f06716', '{"userId":"c741c349-a7ad-47c2-86f8-e7ab63f06716","event":"REQUEST_VALIDATION_BULK","count":1,"notes":null}', 'TASK_EVENT', 'Elbert Wijaya', 'DESIGNER', NULL, NULL, NULL, NULL, 'TM-202512-0009', NULL, NULL, NULL, NULL),
	(43, 9, '2025-12-04 11:39:40.080', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'TASKS_VALIDATED user=c741c349-a7ad-47c2-86f8-e7ab63f06716', '{"userId":"c741c349-a7ad-47c2-86f8-e7ab63f06716","event":"TASKS_VALIDATED","count":1,"notes":null}', 'TASK_EVENT', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0009', NULL, NULL, NULL, NULL),
	(44, 9, '2025-12-04 11:54:30.039', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', 'TASKS_REQUESTED_VALIDATION user=c741c349-a7ad-47c2-86f8-e7ab63f06716', '{"userId":"c741c349-a7ad-47c2-86f8-e7ab63f06716","event":"REQUEST_VALIDATION_BULK","count":3,"notes":null}', 'TASK_EVENT', 'Elbert Wijaya', 'DESIGNER', NULL, NULL, NULL, NULL, 'TM-202512-0009', NULL, NULL, NULL, NULL),
	(45, 10, '2025-12-05 03:46:05.114', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'CREATE ORDER', NULL, 'CREATED', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0010', NULL, NULL, NULL, NULL),
	(46, 11, '2025-12-05 03:49:48.466', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'CREATE ORDER', NULL, 'CREATED', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0011', NULL, NULL, NULL, NULL),
	(47, 12, '2025-12-05 03:57:48.990', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'CREATE ORDER', NULL, 'CREATED', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0012', NULL, NULL, NULL, NULL),
	(48, 9, '2025-12-05 04:01:07.836', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'TASKS_VALIDATED user=c741c349-a7ad-47c2-86f8-e7ab63f06716', '{"userId":"c741c349-a7ad-47c2-86f8-e7ab63f06716","event":"TASKS_VALIDATED","count":3,"notes":null}', 'TASK_EVENT', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0009', NULL, NULL, NULL, NULL),
	(49, 12, '2025-12-05 04:02:05.561', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'STATUS: MENUNGGU -> DALAM_PROSES', '{"from":"MENUNGGU","to":"DALAM_PROSES"}', 'STATUS_CHANGED', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0012', NULL, NULL, 'MENUNGGU', 'DALAM_PROSES'),
	(50, 11, '2025-12-05 04:02:39.807', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'STATUS: MENUNGGU -> DALAM_PROSES', '{"from":"MENUNGGU","to":"DALAM_PROSES"}', 'STATUS_CHANGED', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0011', NULL, NULL, 'MENUNGGU', 'DALAM_PROSES'),
	(51, 10, '2025-12-05 04:05:01.527', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'STATUS: MENUNGGU -> DALAM_PROSES', '{"from":"MENUNGGU","to":"DALAM_PROSES"}', 'STATUS_CHANGED', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0010', NULL, NULL, 'MENUNGGU', 'DALAM_PROSES'),
	(52, 11, '2025-12-06 07:56:03.634', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', 'TASKS_REQUESTED_VALIDATION user=c741c349-a7ad-47c2-86f8-e7ab63f06716', '{"userId":"c741c349-a7ad-47c2-86f8-e7ab63f06716","event":"REQUEST_VALIDATION_BULK","count":3,"notes":null}', 'TASK_EVENT', 'Elbert Wijaya', 'DESIGNER', NULL, NULL, NULL, NULL, 'TM-202512-0011', NULL, NULL, NULL, NULL),
	(53, 12, '2025-12-13 08:15:10.902', '2af408fa-ab2a-4db2-a2b6-931837c49f61', 'TASKS_REQUESTED_VALIDATION user=2af408fa-ab2a-4db2-a2b6-931837c49f61', '{"userId":"2af408fa-ab2a-4db2-a2b6-931837c49f61","event":"REQUEST_VALIDATION_BULK","count":3,"notes":null}', 'TASK_EVENT', 'Saipe', 'CASTER', NULL, NULL, NULL, NULL, 'TM-202512-0012', NULL, NULL, NULL, NULL),
	(54, 12, '2025-12-13 08:15:49.453', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'TASKS_VALIDATED user=2af408fa-ab2a-4db2-a2b6-931837c49f61', '{"userId":"2af408fa-ab2a-4db2-a2b6-931837c49f61","event":"TASKS_VALIDATED","count":3,"notes":null}', 'TASK_EVENT', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0012', NULL, NULL, NULL, NULL),
	(55, 11, '2025-12-13 08:15:53.209', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'TASKS_VALIDATED user=c741c349-a7ad-47c2-86f8-e7ab63f06716', '{"userId":"c741c349-a7ad-47c2-86f8-e7ab63f06716","event":"TASKS_VALIDATED","count":3,"notes":null}', 'TASK_EVENT', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0011', NULL, NULL, NULL, NULL),
	(59, 9, '2025-12-20 03:41:08.557', '2af408fa-ab2a-4db2-a2b6-931837c49f61', 'TASKS_REQUESTED_VALIDATION user=2af408fa-ab2a-4db2-a2b6-931837c49f61', '{"userId":"2af408fa-ab2a-4db2-a2b6-931837c49f61","event":"REQUEST_VALIDATION_BULK","count":3,"notes":null}', 'TASK_EVENT', 'Saipe', 'CASTER', NULL, NULL, NULL, NULL, 'TM-202512-0009', NULL, NULL, NULL, NULL),
	(60, 9, '2025-12-20 03:41:27.770', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'TASKS_VALIDATED user=2af408fa-ab2a-4db2-a2b6-931837c49f61', '{"userId":"2af408fa-ab2a-4db2-a2b6-931837c49f61","event":"TASKS_VALIDATED","count":3,"notes":null}', 'TASK_EVENT', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0009', NULL, NULL, NULL, NULL),
	(61, 14, '2025-12-20 03:47:48.911', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'CREATE ORDER', NULL, 'CREATED', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0014', NULL, NULL, NULL, NULL),
	(62, 14, '2025-12-20 03:48:14.786', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'STATUS: MENUNGGU -> DALAM_PROSES', '{"from":"MENUNGGU","to":"DALAM_PROSES"}', 'STATUS_CHANGED', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0014', NULL, NULL, 'MENUNGGU', 'DALAM_PROSES'),
	(63, 15, '2025-12-20 03:56:26.966', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'CREATE ORDER', NULL, 'CREATED', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0015', NULL, NULL, NULL, NULL),
	(64, 16, '2025-12-29 02:59:04.701', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'CREATE ORDER', NULL, 'CREATED', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0016', NULL, NULL, NULL, NULL),
	(65, 16, '2025-12-29 02:59:16.578', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'STATUS: MENUNGGU -> DALAM_PROSES', '{"from":"MENUNGGU","to":"DALAM_PROSES"}', 'STATUS_CHANGED', 'Sales', 'SALES', NULL, NULL, NULL, NULL, 'TM-202512-0016', NULL, NULL, 'MENUNGGU', 'DALAM_PROSES');

-- Dumping structure for table sumatra_jewelry_mobile.orderstone
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry_mobile.orderstone: ~2 rows (approximately)
DELETE FROM `orderstone`;
INSERT INTO `orderstone` (`id`, `orderId`, `bentuk`, `jumlah`, `berat`, `createdAt`) VALUES
	(15, 12, 'Round', 8, 0.03, '2025-12-05 03:57:48.984'),
	(16, 14, 'Round', 1, 0.25, '2025-12-20 03:47:48.903');

-- Dumping structure for table sumatra_jewelry_mobile.ordertask
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
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry_mobile.ordertask: ~32 rows (approximately)
DELETE FROM `ordertask`;
INSERT INTO `ordertask` (`id`, `orderId`, `stage`, `status`, `assigned_to_id`, `created_at`, `notes`, `requested_done_at`, `updated_at`, `validated_at`, `validated_by_id`, `job_role`, `checked_at`, `checked_by_id`, `is_checked`) VALUES
	(37, 9, 'Awal', 'OPEN', NULL, '2025-12-03 07:48:56.799', NULL, NULL, '2025-12-03 07:48:56.791', NULL, NULL, NULL, NULL, NULL, 0),
	(38, 9, 'Print Resin', 'DONE', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-03 07:52:09.868', NULL, '2025-12-03 07:53:02.897', '2025-12-04 11:39:40.068', '2025-12-04 11:39:40.068', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'DESIGNER', '2025-12-03 07:52:58.285', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', 1),
	(39, 9, 'Gambar 3D', 'DONE', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-04 11:40:10.792', NULL, '2025-12-04 11:54:30.031', '2025-12-05 04:01:07.819', '2025-12-05 04:01:07.819', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'DESIGNER', '2025-12-04 11:54:18.298', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', 1),
	(40, 9, 'Print Resin', 'DONE', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-04 11:40:10.792', NULL, '2025-12-04 11:54:30.031', '2025-12-05 04:01:07.819', '2025-12-05 04:01:07.819', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'DESIGNER', '2025-12-04 11:54:19.931', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', 1),
	(41, 9, 'Pengecekan', 'DONE', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-04 11:40:10.792', NULL, '2025-12-04 11:54:30.031', '2025-12-05 04:01:07.819', '2025-12-05 04:01:07.819', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'DESIGNER', '2025-12-04 11:54:20.678', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', 1),
	(42, 10, 'Awal', 'OPEN', NULL, '2025-12-05 03:46:05.111', NULL, NULL, '2025-12-05 03:46:05.109', NULL, NULL, NULL, NULL, NULL, 0),
	(43, 11, 'Awal', 'OPEN', NULL, '2025-12-05 03:49:48.464', NULL, NULL, '2025-12-05 03:49:48.462', NULL, NULL, NULL, NULL, NULL, 0),
	(44, 12, 'Awal', 'OPEN', NULL, '2025-12-05 03:57:48.988', NULL, NULL, '2025-12-05 03:57:48.986', NULL, NULL, NULL, NULL, NULL, 0),
	(45, 12, 'Pasang Tiang', 'DONE', '2af408fa-ab2a-4db2-a2b6-931837c49f61', '2025-12-05 04:02:05.561', NULL, '2025-12-13 08:15:10.885', '2025-12-13 08:15:49.437', '2025-12-13 08:15:49.437', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'CASTER', '2025-12-13 08:15:06.160', '2af408fa-ab2a-4db2-a2b6-931837c49f61', 1),
	(46, 12, 'Cor', 'DONE', '2af408fa-ab2a-4db2-a2b6-931837c49f61', '2025-12-05 04:02:05.561', NULL, '2025-12-13 08:15:10.885', '2025-12-13 08:15:49.438', '2025-12-13 08:15:49.438', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'CASTER', '2025-12-13 08:15:06.757', '2af408fa-ab2a-4db2-a2b6-931837c49f61', 1),
	(47, 12, 'Kasih Ke Admin', 'DONE', '2af408fa-ab2a-4db2-a2b6-931837c49f61', '2025-12-05 04:02:05.561', NULL, '2025-12-13 08:15:10.885', '2025-12-13 08:15:49.438', '2025-12-13 08:15:49.438', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'CASTER', '2025-12-13 08:15:07.335', '2af408fa-ab2a-4db2-a2b6-931837c49f61', 1),
	(48, 11, 'Gambar 3D', 'DONE', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-05 04:02:39.807', NULL, '2025-12-06 07:56:03.614', '2025-12-13 08:15:53.195', '2025-12-13 08:15:53.195', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'DESIGNER', '2025-12-06 07:55:30.711', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', 1),
	(49, 11, 'Print Resin', 'DONE', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-05 04:02:39.807', NULL, '2025-12-06 07:56:03.615', '2025-12-13 08:15:53.195', '2025-12-13 08:15:53.195', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'DESIGNER', '2025-12-06 07:55:32.264', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', 1),
	(50, 11, 'Pengecekan', 'DONE', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-05 04:02:39.807', NULL, '2025-12-06 07:56:03.615', '2025-12-13 08:15:53.195', '2025-12-13 08:15:53.195', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'DESIGNER', '2025-12-06 07:55:40.113', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', 1),
	(51, 10, 'Print Resin', 'IN_PROGRESS', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-05 04:05:01.527', NULL, NULL, '2025-12-05 05:34:18.550', NULL, NULL, 'DESIGNER', NULL, NULL, 0),
	(52, 10, 'Pengecekan', 'IN_PROGRESS', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-05 04:05:01.527', NULL, NULL, '2025-12-05 05:34:18.550', NULL, NULL, 'DESIGNER', '2025-12-06 07:55:01.795', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', 1),
	(53, 10, 'Gambar 3D', 'IN_PROGRESS', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-05 04:05:01.527', NULL, NULL, '2025-12-05 05:34:18.550', NULL, NULL, 'DESIGNER', '2025-12-06 07:55:00.609', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', 1),
	(54, 11, 'Input Data', 'ASSIGNED', 'f1f7db96-af10-4749-a8a7-fe6552872104', '2025-12-13 08:16:22.124', NULL, NULL, '2025-12-13 08:16:22.122', NULL, NULL, 'INVENTORY', NULL, NULL, 0),
	(55, 9, 'Pasang Tiang', 'DONE', '2af408fa-ab2a-4db2-a2b6-931837c49f61', '2025-12-13 08:16:39.558', NULL, '2025-12-20 03:41:08.536', '2025-12-20 03:41:27.757', '2025-12-20 03:41:27.757', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'CASTER', '2025-12-20 03:41:04.458', '2af408fa-ab2a-4db2-a2b6-931837c49f61', 1),
	(56, 9, 'Cor', 'DONE', '2af408fa-ab2a-4db2-a2b6-931837c49f61', '2025-12-13 08:16:39.558', NULL, '2025-12-20 03:41:08.536', '2025-12-20 03:41:27.757', '2025-12-20 03:41:27.757', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'CASTER', '2025-12-20 03:41:05.616', '2af408fa-ab2a-4db2-a2b6-931837c49f61', 1),
	(57, 9, 'Kasih Ke Admin', 'DONE', '2af408fa-ab2a-4db2-a2b6-931837c49f61', '2025-12-13 08:16:39.558', NULL, '2025-12-20 03:41:08.536', '2025-12-20 03:41:27.758', '2025-12-20 03:41:27.758', '71ddd90c-e324-4c63-a3c2-2daaa965aa46', 'CASTER', '2025-12-20 03:41:07.486', '2af408fa-ab2a-4db2-a2b6-931837c49f61', 1),
	(58, 12, 'Input Data', 'ASSIGNED', 'f1f7db96-af10-4749-a8a7-fe6552872104', '2025-12-13 08:17:04.468', NULL, NULL, '2025-12-13 08:17:04.467', NULL, NULL, 'INVENTORY', NULL, NULL, 0),
	(63, 9, 'Input Data', 'ASSIGNED', 'f1f7db96-af10-4749-a8a7-fe6552872104', '2025-12-20 03:41:43.963', NULL, NULL, '2025-12-20 03:41:43.961', NULL, NULL, 'INVENTORY', NULL, NULL, 0),
	(64, 14, 'Awal', 'OPEN', NULL, '2025-12-20 03:47:48.908', NULL, NULL, '2025-12-20 03:47:48.907', NULL, NULL, NULL, NULL, NULL, 0),
	(65, 14, 'Gambar 3D', 'IN_PROGRESS', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-20 03:48:14.786', NULL, NULL, '2025-12-29 06:46:15.544', NULL, NULL, 'DESIGNER', NULL, NULL, 0),
	(66, 14, 'Print Resin', 'IN_PROGRESS', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-20 03:48:14.786', NULL, NULL, '2025-12-29 06:46:15.544', NULL, NULL, 'DESIGNER', NULL, NULL, 0),
	(67, 14, 'Pengecekan', 'IN_PROGRESS', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-20 03:48:14.786', NULL, NULL, '2025-12-29 06:46:15.544', NULL, NULL, 'DESIGNER', NULL, NULL, 0),
	(68, 15, 'Awal', 'OPEN', NULL, '2025-12-20 03:56:26.961', NULL, NULL, '2025-12-20 03:56:26.959', NULL, NULL, NULL, NULL, NULL, 0),
	(69, 16, 'Awal', 'OPEN', NULL, '2025-12-29 02:59:04.698', NULL, NULL, '2025-12-29 02:59:04.697', NULL, NULL, NULL, NULL, NULL, 0),
	(70, 16, 'Gambar 3D', 'IN_PROGRESS', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-29 02:59:16.578', NULL, NULL, '2025-12-29 06:46:14.095', NULL, NULL, 'DESIGNER', NULL, NULL, 0),
	(71, 16, 'Print Resin', 'IN_PROGRESS', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-29 02:59:16.578', NULL, NULL, '2025-12-29 06:46:14.095', NULL, NULL, 'DESIGNER', NULL, NULL, 0),
	(72, 16, 'Pengecekan', 'IN_PROGRESS', 'c741c349-a7ad-47c2-86f8-e7ab63f06716', '2025-12-29 02:59:16.578', NULL, NULL, '2025-12-29 06:46:14.095', NULL, NULL, 'DESIGNER', NULL, NULL, 0);

-- Dumping structure for table sumatra_jewelry_mobile.pushtoken
DROP TABLE IF EXISTS `pushtoken`;
CREATE TABLE IF NOT EXISTS `pushtoken` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `platform` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pushtoken_token_key` (`token`),
  KEY `PushToken_userId_idx` (`userId`),
  CONSTRAINT `pushtoken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `account` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table sumatra_jewelry_mobile.pushtoken: ~0 rows (approximately)
DELETE FROM `pushtoken`;

-- Dumping structure for table sumatra_jewelry_mobile._prisma_migrations
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

-- Dumping data for table sumatra_jewelry_mobile._prisma_migrations: ~36 rows (approximately)
DELETE FROM `_prisma_migrations`;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
	('01c3cf0a-bf4c-4c37-8a1e-05cc17107645', '2c264520a996df132ea47f63619e6d269d1288d4119c8c74377e9f9f9b790211', '2025-11-20 06:19:22.363', '20250908112503_', NULL, NULL, '2025-11-20 06:19:22.093', 1),
	('055d30a3-f817-4ba4-ab75-647dc997e426', 'c9d303ee5f818c947a0a5b6fb5f3dedf1e8bf54833939f917edde41260868905', '2025-11-20 06:19:21.765', '20250908074114_order_stone_indexes_and_summary', NULL, NULL, '2025-11-20 06:19:21.718', 1),
	('08d5f2fb-c186-477b-a8e9-e0a6e7098bba', '27c5c11d9a71b7fdbeb7c648933b1bf2a6f5743248897f6339de1d48579d40f1', '2025-11-25 04:56:45.866', '20251125045645_add_menunggu_status', NULL, NULL, '2025-11-25 04:56:45.720', 1),
	('1bf0def6-2d01-466c-b063-ba9e47c03e42', '05632e8a12ccb61be545e6e5d2e6d35f193b688dcaa12e19db7411942852bc78', '2025-11-27 04:22:20.421', '20251127042220_remove_unused_inventory_columns', NULL, NULL, '2025-11-27 04:22:20.374', 1),
	('2170a68a-1827-422c-8416-b3466ef46952', '505450aac8703ac8d2b73d6fc2542c8938f6123343fd2e0ed78cd5c1e3539eda', '2025-11-20 06:19:21.715', '20250908070000_order_stone_indexes_and_summary', NULL, NULL, '2025-11-20 06:19:21.671', 1),
	('24329934-8f4e-42aa-9c24-3c227d6dc137', '3a003b2840584cd0d9c3d10429d1c9e3476dcd727277eac1de21466cdaf8df8d', '2025-11-20 06:19:21.272', '20250903145107_add_multiple_images', NULL, NULL, '2025-11-20 06:19:21.231', 1),
	('26d38691-8827-4843-b8aa-78aa16f7462c', 'b8a50838cf002e65525ad5af725fb6ef89733fe9dba2ebd4691b153b8a0d0f94', '2025-11-20 06:19:22.445', '20250908151733_add_user_job_role', NULL, NULL, '2025-11-20 06:19:22.406', 1),
	('3f8355b1-1f49-4bf8-88ef-887ce9de72f3', '394e1c986f4bc2bed1d0da27fb913493cc2b45570f7cc9e891f57a8ff054d33b', '2025-11-20 06:19:23.309', '20251022090526_add_avatar_column', NULL, NULL, '2025-11-20 06:19:23.261', 1),
	('421763a3-3ca3-449c-b389-c96d3f820725', '0b084e352b0065c1b29b7c1598a2ab4ed84359c9eed9e5c05d45ba49aec16e7f', '2025-11-20 06:19:24.415', '20251120055038_add_inventory_status_and_stone', NULL, NULL, '2025-11-20 06:19:24.284', 1),
	('4436734d-b43f-4af2-a16b-f19f93f634e7', '9a6964649d345e7ea17a705f7ef75dd1e56610c5e953fc54f0c7d7f3f2a975b0', '2025-11-20 06:19:23.209', '20250923043523_orderhistory_rich_audit', NULL, NULL, '2025-11-20 06:19:23.010', 1),
	('4bd49bc9-22f6-419d-8002-fb7789e46025', 'fcc00eb3eda2f1914c340bcce5835bda855aa9cd6c24acfda923290fd422940e', '2025-11-20 06:19:24.281', '20251023061741_', NULL, NULL, '2025-11-20 06:19:23.419', 1),
	('5600299e-dee6-46d6-8df9-6a746ced67c0', 'c43c69d836759cd781457ef7ceb9d212e213a3bccdde1f2e2f018d30f8301bf9', '2025-11-20 06:19:22.703', '20250915051632_add_task_checklist', NULL, NULL, '2025-11-20 06:19:22.607', 1),
	('5d314329-0c10-4b85-86ac-fd108de4230b', 'a69ca05e3ce50a71d3197efabeb090679ed4de0455887bdb76d514a978db6c8f', '2025-11-20 06:19:22.090', '20250908111050_add_order_tasks', NULL, NULL, '2025-11-20 06:19:21.878', 1),
	('71cc585c-29c2-425d-8f83-73f5929074de', '14574a67d770271e2005678af92ff5e199f7b83b6353814b7f20b8d4a42119c8', '2025-11-20 06:19:21.669', '20250903162432_drop_single_reference_image_url', NULL, NULL, '2025-11-20 06:19:21.630', 1),
	('7321a147-283c-446e-b2f9-34c009b51a18', 'de889cfa2c937541ecf91aad32acbf9040e32968fbdcdcde905b98782ad75180', '2025-11-20 06:19:22.403', '20250908145850_add_task_job_role', NULL, NULL, '2025-11-20 06:19:22.365', 1),
	('8257d2c3-8308-48fe-bd5a-81e8e48d1192', 'e92f69999320a232ea759095f6be593203b2ce7420f2d4680a86e8e28de3ac49', '2025-11-20 06:19:21.867', '20250908080000_drop_final_weight_and_dp_nullable', NULL, NULL, '2025-11-20 06:19:21.768', 1),
	('84d727f4-f399-4ed6-ad8e-41fc5094f139', '98b4612f349d606881e5b24c1fd3789e56e648a60f2867798b779817d7ea2728', '2025-12-16 06:50:12.467', '20251216065012_', NULL, NULL, '2025-12-16 06:50:12.359', 1),
	('85eeab50-19a6-4e31-a656-ce612dfe9f09', '6bd9e40875ffebc833b70d7608bd4f01325297341563ebfca810ab05697bb638', '2025-11-20 06:19:23.258', '20250930064155_add_ring_size', NULL, NULL, '2025-11-20 06:19:23.212', 1),
	('865ef6c1-09b9-46be-a9fd-865324eb370e', '1f6fc0b6dba2d18eb87904e4541e81c5df9c495b24eeb9ec54fcdf512d33bd78', '2025-11-20 06:19:22.604', '20250908163313_', NULL, NULL, '2025-11-20 06:19:22.559', 1),
	('87f7f0ee-e3fe-4187-bfe0-85f845b202df', '2f52c1bdc89cfe2a2ff211aa46c880bfc91ef5ed6778fa6c9df2e505a1eca7ec', '2025-11-27 05:08:21.632', '20251127050821_drop_karat_and_rename_size', NULL, NULL, '2025-11-27 05:08:21.579', 1),
	('8ad95a8d-ce6b-4e87-939e-faa9bfa49064', 'daaeecb48b816ad1a1b68e54427827178afef143e0e244d9ad2e85076da9c82e', '2025-11-20 06:19:22.949', '20250915085516_', NULL, NULL, '2025-11-20 06:19:22.706', 1),
	('939a224a-f815-4588-8c4d-6c3191ea68a7', '8c7cbd3dd1c69a4e555624c82cdd54d20eed6d687303e8442c6e8a81ee4f2f1e', '2025-11-20 06:19:24.568', '20251120120000_add_inventory_indexes', NULL, NULL, '2025-11-20 06:19:24.469', 1),
	('96da69d2-035e-4421-8d82-588504c6d782', '884f7ceb605b89ffc599a24f9d2774d0c5890b5973c2843dbf13e053d2b5bcde', '2025-11-20 06:19:21.319', '20250903153139_drop_legacy_kadar_berat_target', NULL, NULL, '2025-11-20 06:19:21.275', 1),
	('9aa658a1-d3ea-4dee-be0c-2c55ecc42f76', '554c315091eaf9b4f76337e5003cf4fbf0bbee65d6ccbfe236326977336d798b', '2025-11-20 06:19:21.540', '20250903153633_snake_case_order_fields', NULL, NULL, '2025-11-20 06:19:21.322', 1),
	('9f611738-2be7-4d8f-bca7-aa2c5733913b', 'ebde005c91be3fd8605d9ac3c56f0a2ac5b0d9fe6198f9cc5d02231fda7e655e', '2025-11-25 04:59:14.913', '20251125045914_remove_diterima_status', NULL, NULL, '2025-11-25 04:59:14.766', 1),
	('a713cf19-8664-4e13-a1ea-d01c5c418065', '13e2d3bef2445dae3140e430efe1dee6e3ded6b4fea906b463ad0d3ac06be1ca', '2025-11-20 06:19:21.876', '20250908090000_tasks_assignment_and_requests', NULL, NULL, '2025-11-20 06:19:21.870', 1),
	('a924e774-8f30-4caa-86a8-c9a70412e08c', 'aab7b10edc8be51334023f0da7ca146af06cede864936bc86a29ec6c157b5089', '2025-11-27 04:48:50.754', '20251127044850_rename_size_to_ring_size', NULL, NULL, '2025-11-27 04:48:50.704', 1),
	('afdc712d-d83f-4e28-9b29-432f615b080c', 'f959cd4d745e45a46eba9c540390233f1b9eefb05ba6666eeccde8f88eb8992d', '2025-11-20 06:19:21.228', '20250903133411_extend_order_fields', NULL, NULL, '2025-11-20 06:19:21.116', 1),
	('bb7bdf7d-f4be-4ff8-bd8d-86169e88367f', '80ef64b926f9dd23c251879bf7a096275160245cf704f6d1afd8f14f900419db', '2025-11-20 06:19:21.114', '20250903112235_init', NULL, NULL, '2025-11-20 06:19:20.831', 1),
	('c2da4026-8b1d-4e60-86d6-9bc67fe4f124', 'fb8ee026963b5b62556c74fd97fccb39b2643484a7c9c95eb556a238051fa3e8', '2025-11-20 06:19:21.628', '20250903161943_drop_ongkos_column', NULL, NULL, '2025-11-20 06:19:21.586', 1),
	('cc1a69bf-e3a6-427a-9497-8da77101971b', 'd6f70c8b2fc4987f39a6590b9431f093bafe4f8a40b424cb19db1a43423added', '2025-11-20 06:19:32.747', '20251120061932_apply_inventory_indexes_fix', NULL, NULL, '2025-11-20 06:19:32.612', 1),
	('cf755810-92b9-409b-8240-4d20f1531bb0', 'acbcc5f5f98ff21501f9d32d5b1e5823579e6427f60638e64805e19a14c568a8', '2025-11-20 06:19:23.007', '20250915090525_', NULL, NULL, '2025-11-20 06:19:22.960', 1),
	('d0ca131a-f109-43f5-a5b9-95aac7fb7d25', '3beef5e3637164a78f7919bb3278a64a8685587f2077069633c68870b7ec6bf2', '2025-11-20 06:19:22.556', '20250908160334_', NULL, NULL, '2025-11-20 06:19:22.448', 1),
	('d4de04a5-3bba-47c4-897a-2b77c019f7f1', '3ccdea592a8c0e2c9b819666b4dfbb87f6c3e6476a61e0694170d95ba85bfcb2', '2025-11-20 06:19:22.957', '20250915090438_', NULL, NULL, '2025-11-20 06:19:22.951', 1),
	('e1763d39-98a3-45b8-a7d1-16e7ef73722e', '1ba9f6fe6fa37be315b95d4a7b3c85024c57ef6846f974335a78318a5bf425e6', '2025-11-20 06:19:21.583', '20250903161757_rename_promised_ready_date', NULL, NULL, '2025-11-20 06:19:21.543', 1),
	('f08afb8f-af59-4f68-8864-6563370d99d0', '10f2b7f17643691a5f6734c91921061231058ae69eee966b431f387d173fce80', '2025-11-20 06:19:23.416', '20251023053414_init_account_branch', NULL, NULL, '2025-11-20 06:19:23.312', 1),
	('fe784c62-5db6-48f7-bd13-58ca7a7a0fc5', '49946db4aef26b8e0310f38287ff80997e02429068687614ca4797dca8b605ed', '2025-11-20 06:19:24.466', '202511200930_add_inventory_branch_placement', NULL, NULL, '2025-11-20 06:19:24.418', 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
