import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database: deleting tasks, histories, stones, orders...');
  // Delete in dependency order to satisfy FK constraints
  await (prisma as any).orderTask.deleteMany({});
  await (prisma as any).orderHistory.deleteMany({});
  await (prisma as any).orderStone.deleteMany({});
  await prisma.order.deleteMany({});

  // Optional: reset AUTO_INCREMENT counters for MySQL
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE `OrderTask` AUTO_INCREMENT = 1');
  } catch {}
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE `OrderHistory` AUTO_INCREMENT = 1');
  } catch {}
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE `OrderStone` AUTO_INCREMENT = 1');
  } catch {}
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE `Order` AUTO_INCREMENT = 1');
  } catch {}

  console.log('Done.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
