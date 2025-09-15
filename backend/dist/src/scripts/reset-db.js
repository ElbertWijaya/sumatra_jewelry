"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Resetting database: deleting tasks, histories, stones, orders...');
    await prisma.orderTask.deleteMany({});
    await prisma.orderHistory.deleteMany({});
    await prisma.orderStone.deleteMany({});
    await prisma.order.deleteMany({});
    try {
        await prisma.$executeRawUnsafe('ALTER TABLE `OrderTask` AUTO_INCREMENT = 1');
    }
    catch { }
    try {
        await prisma.$executeRawUnsafe('ALTER TABLE `OrderHistory` AUTO_INCREMENT = 1');
    }
    catch { }
    try {
        await prisma.$executeRawUnsafe('ALTER TABLE `OrderStone` AUTO_INCREMENT = 1');
    }
    catch { }
    try {
        await prisma.$executeRawUnsafe('ALTER TABLE `Order` AUTO_INCREMENT = 1');
    }
    catch { }
    console.log('Done.');
}
main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=reset-db.js.map