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
	('023af1dc-e8be-4089-a403-af996ef7e42e', 'admin@tokomas.local', 'Aceng', '$argon2id$v=19$m=65536,t=3,p=4$TTxODsmdK3ij2tvHiwkgxQ$HoyYwXilFm9IA/MLvUNsvJOC4rie+UvbKpc5kKcHbOs', '2025-10-02 04:44:40.629', 'ADMINISTRATOR'),
	('08997e4b-cda0-4e21-8a8d-322a879f701e', 'finisher@tokomas.local', 'Ayu', '$argon2id$v=19$m=65536,t=3,p=4$oQSsgtDfSn2mBCrq60KWXw$pgbIghcMCTb0aVqHbs0Qf9clgkqeRto3ukm+w4sk7ag', '2025-10-02 04:44:40.869', 'FINISHER'),
	('7607c2f7-36fa-4c65-9fad-8fb1da7afd65', 'caster@tokomas.local', 'Hanpin', '$argon2id$v=19$m=65536,t=3,p=4$ix44xqompHUvxpjFisb5kg$0HSxzh3AqQgosyWgkw3Vx+wkILU0Ez6cy6TwRKG7x6c', '2025-10-02 04:44:40.794', 'CASTER'),
	('c6914807-0bcb-43e8-bf8e-5a14545bb60d', 'carver@tokomas.local', 'Acai', '$argon2id$v=19$m=65536,t=3,p=4$HoE3aLglqmYGlu+FBFSjXg$Gr5a+NXIszxymy4QXugSsAakC8S13rnRemWUqzGWoSk', '2025-10-02 04:44:40.755', 'CARVER'),
	('d5af97c6-48b3-46de-b3f6-b9a599967433', 'sales@tokomas.local', 'Yanti', '$argon2id$v=19$m=65536,t=3,p=4$B+b+fArUlXuleXI5WiYipA$E2gnlKrLc8/Jh/B1umPsK1ZKUlkthxtp2ZFR0t/nyeE', '2025-10-02 04:44:40.678', 'SALES'),
	('da870108-ce4f-41ed-b9d4-071dc04ab8eb', 'designer@tokomas.local', 'Elbert Wijaya', '$argon2id$v=19$m=65536,t=3,p=4$fnV9+DV2OFECfEeNOSLaNQ$jiPEASWRtVpO4gOUaqvIEenyzL9AbWr8E3+alJbZHIY', '2025-10-02 04:44:40.716', 'DESIGNER'),
	('dadddb93-eee4-4b11-b1a5-0133e09dd129', 'inventory@tokomas.local', 'Suk Mai D', '$argon2id$v=19$m=65536,t=3,p=4$O6lIB8w8mp1YDvaYvW+Lbw$VdTFPYcl2kplEqgEn/TqYiuWzNOKJX2oC4KkaUv4WXc', '2025-10-02 04:44:40.908', 'INVENTORY'),
	('f303e7ff-a2e3-46e9-8d83-a382946c583d', 'diamond@tokomas.local', 'Yanti Atas', '$argon2id$v=19$m=65536,t=3,p=4$K5W9v3udti6vf/vmFnLMtA$Q2e2VI2aujeWzAORrzJJmXOLU77Xi9gZEC0WAmygh5Y', '2025-10-02 04:44:40.831', 'DIAMOND_SETTER');

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
  `ring_size` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Order_code_key` (`code`),
  KEY `Order_created_by_id_fkey` (`created_by_id`),
  KEY `Order_updated_by_id_fkey` (`updated_by_id`),
  CONSTRAINT `Order_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `appuser` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Order_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `appuser` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
	('0da62676-7b79-4529-8afb-4ae59739ae89', 'daaeecb48b816ad1a1b68e54427827178afef143e0e244d9ad2e85076da9c82e', '2025-09-30 06:41:50.411', '20250915085516_', NULL, NULL, '2025-09-30 06:41:50.147', 1),
	('17c3c4bb-641a-4e03-8425-388af010512a', 'c43c69d836759cd781457ef7ceb9d212e213a3bccdde1f2e2f018d30f8301bf9', '2025-09-30 06:41:50.144', '20250915051632_add_task_checklist', NULL, NULL, '2025-09-30 06:41:50.034', 1),
	('1adb4fc6-db28-497e-8a31-b9d52dfd9afb', '3ccdea592a8c0e2c9b819666b4dfbb87f6c3e6476a61e0694170d95ba85bfcb2', '2025-09-30 06:41:50.420', '20250915090438_', NULL, NULL, '2025-09-30 06:41:50.414', 1),
	('20091dd7-e328-44a0-90d4-b08b11f2b580', '14574a67d770271e2005678af92ff5e199f7b83b6353814b7f20b8d4a42119c8', '2025-09-30 06:41:48.981', '20250903162432_drop_single_reference_image_url', NULL, NULL, '2025-09-30 06:41:48.931', 1),
	('27740319-e989-4c02-9dc9-f5f071944595', 'e92f69999320a232ea759095f6be593203b2ce7420f2d4680a86e8e28de3ac49', '2025-09-30 06:41:49.210', '20250908080000_drop_final_weight_and_dp_nullable', NULL, NULL, '2025-09-30 06:41:49.097', 1),
	('40968547-b114-4802-82d3-df0436b2278f', '1f6fc0b6dba2d18eb87904e4541e81c5df9c495b24eeb9ec54fcdf512d33bd78', '2025-09-30 06:41:50.031', '20250908163313_', NULL, NULL, '2025-09-30 06:41:49.983', 1),
	('5c2375a6-d0c6-456e-bf9f-afd646704ae0', 'b8a50838cf002e65525ad5af725fb6ef89733fe9dba2ebd4691b153b8a0d0f94', '2025-09-30 06:41:49.850', '20250908151733_add_user_job_role', NULL, NULL, '2025-09-30 06:41:49.804', 1),
	('5c4815b9-9537-487d-a5e0-f4c50137498e', 'de889cfa2c937541ecf91aad32acbf9040e32968fbdcdcde905b98782ad75180', '2025-09-30 06:41:49.801', '20250908145850_add_task_job_role', NULL, NULL, '2025-09-30 06:41:49.754', 1),
	('68a178f0-fac7-4c76-8338-e9a02c4dd745', '2c264520a996df132ea47f63619e6d269d1288d4119c8c74377e9f9f9b790211', '2025-09-30 06:41:49.751', '20250908112503_', NULL, NULL, '2025-09-30 06:41:49.455', 1),
	('718b1e51-2385-499d-9437-85993949bf22', '80ef64b926f9dd23c251879bf7a096275160245cf704f6d1afd8f14f900419db', '2025-09-30 06:41:48.331', '20250903112235_init', NULL, NULL, '2025-09-30 06:41:48.019', 1),
	('7d0bca72-d875-41e5-9288-17ab51462cc9', '505450aac8703ac8d2b73d6fc2542c8938f6123343fd2e0ed78cd5c1e3539eda', '2025-09-30 06:41:49.036', '20250908070000_order_stone_indexes_and_summary', NULL, NULL, '2025-09-30 06:41:48.984', 1),
	('9b0f1929-16ba-411c-bb3d-1d4da955ee7e', 'c9d303ee5f818c947a0a5b6fb5f3dedf1e8bf54833939f917edde41260868905', '2025-09-30 06:41:49.094', '20250908074114_order_stone_indexes_and_summary', NULL, NULL, '2025-09-30 06:41:49.039', 1),
	('9db637e6-be04-4649-8657-ad689e47ace6', '1ba9f6fe6fa37be315b95d4a7b3c85024c57ef6846f974335a78318a5bf425e6', '2025-09-30 06:41:48.873', '20250903161757_rename_promised_ready_date', NULL, NULL, '2025-09-30 06:41:48.823', 1),
	('a1b334a2-6886-494e-b8c1-3bc9b6904000', 'a69ca05e3ce50a71d3197efabeb090679ed4de0455887bdb76d514a978db6c8f', '2025-09-30 06:41:49.452', '20250908111050_add_order_tasks', NULL, NULL, '2025-09-30 06:41:49.222', 1),
	('a873fddf-5c2e-4167-b581-d1e8d4d0d768', 'fb8ee026963b5b62556c74fd97fccb39b2643484a7c9c95eb556a238051fa3e8', '2025-09-30 06:41:48.928', '20250903161943_drop_ongkos_column', NULL, NULL, '2025-09-30 06:41:48.876', 1),
	('b1a1f8aa-ec60-4333-b7b3-c866b41d637e', 'f959cd4d745e45a46eba9c540390233f1b9eefb05ba6666eeccde8f88eb8992d', '2025-09-30 06:41:48.462', '20250903133411_extend_order_fields', NULL, NULL, '2025-09-30 06:41:48.334', 1),
	('bd3d12c0-89c0-4a1d-a100-924f217b37e5', 'acbcc5f5f98ff21501f9d32d5b1e5823579e6427f60638e64805e19a14c568a8', '2025-09-30 06:41:50.478', '20250915090525_', NULL, NULL, '2025-09-30 06:41:50.423', 1),
	('cadfb455-1b27-4e3f-822c-c001403d1c32', '554c315091eaf9b4f76337e5003cf4fbf0bbee65d6ccbfe236326977336d798b', '2025-09-30 06:41:48.820', '20250903153633_snake_case_order_fields', NULL, NULL, '2025-09-30 06:41:48.570', 1),
	('d1542322-1e06-4de1-858f-195eae643103', '3beef5e3637164a78f7919bb3278a64a8685587f2077069633c68870b7ec6bf2', '2025-09-30 06:41:49.980', '20250908160334_', NULL, NULL, '2025-09-30 06:41:49.853', 1),
	('d6fa4ffb-e2d0-4999-9f04-ed85658206d5', '13e2d3bef2445dae3140e430efe1dee6e3ded6b4fea906b463ad0d3ac06be1ca', '2025-09-30 06:41:49.219', '20250908090000_tasks_assignment_and_requests', NULL, NULL, '2025-09-30 06:41:49.213', 1),
	('d944e8a1-0860-459f-a731-83cb8bee694f', '9a6964649d345e7ea17a705f7ef75dd1e56610c5e953fc54f0c7d7f3f2a975b0', '2025-09-30 06:41:50.722', '20250923043523_orderhistory_rich_audit', NULL, NULL, '2025-09-30 06:41:50.481', 1),
	('e66c75f5-df04-49b1-b116-36386874dcd3', '884f7ceb605b89ffc599a24f9d2774d0c5890b5973c2843dbf13e053d2b5bcde', '2025-09-30 06:41:48.567', '20250903153139_drop_legacy_kadar_berat_target', NULL, NULL, '2025-09-30 06:41:48.517', 1),
	('f7b0bc57-8f69-4f66-a7fb-2b804074d5f5', '3a003b2840584cd0d9c3d10429d1c9e3476dcd727277eac1de21466cdaf8df8d', '2025-09-30 06:41:48.514', '20250903145107_add_multiple_images', NULL, NULL, '2025-09-30 06:41:48.465', 1),
	('fb40e61f-258f-4000-b9dd-ec02d6cd1960', '6bd9e40875ffebc833b70d7608bd4f01325297341563ebfca810ab05697bb638', '2025-09-30 06:41:55.934', '20250930064155_add_ring_size', NULL, NULL, '2025-09-30 06:41:55.886', 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
