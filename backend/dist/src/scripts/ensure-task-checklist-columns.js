"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const columns = await prisma.$queryRawUnsafe("SHOW COLUMNS FROM `OrderTask` WHERE Field IN ('is_checked','checked_at','checked_by_id')");
    const have = new Set(columns.map(c => c.Field));
    if (!have.has('is_checked')) {
        await prisma.$executeRawUnsafe("ALTER TABLE `OrderTask` ADD COLUMN `is_checked` BOOLEAN NOT NULL DEFAULT false");
    }
    if (!have.has('checked_at')) {
        await prisma.$executeRawUnsafe("ALTER TABLE `OrderTask` ADD COLUMN `checked_at` DATETIME(3) NULL");
    }
    if (!have.has('checked_by_id')) {
        await prisma.$executeRawUnsafe("ALTER TABLE `OrderTask` ADD COLUMN `checked_by_id` VARCHAR(191) NULL");
        await prisma.$executeRawUnsafe("ALTER TABLE `OrderTask` ADD CONSTRAINT `OrderTask_checked_by_id_fkey` FOREIGN KEY (`checked_by_id`) REFERENCES `AppUser`(`id`) ON DELETE SET NULL ON UPDATE CASCADE");
    }
    console.log('Checklist columns ensured.');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
//# sourceMappingURL=ensure-task-checklist-columns.js.map