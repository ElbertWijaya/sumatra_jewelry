import { PrismaClient } from '@prisma/client';

// Convert existing PENDING statuses to MENUNGGU before removing PENDING from enums.
// Run AFTER schema contains MENUNGGU (current) and BEFORE dropping PENDING (already removed locally, so ensure data consistency first!).
// Usage:
//   npx ts-node src/scripts/migrate-pending-to-menunggu.ts

const prisma = new PrismaClient();

async function main() {
  console.log('[migrate-pending-to-menunggu] start');
  const countOrders = await prisma.order.count({ where: { status: 'PENDING' as any } });
  if (countOrders) {
    await prisma.$executeRawUnsafe(`UPDATE \`Order\` SET status = 'MENUNGGU' WHERE status = 'PENDING'`);
    console.log(`[orders] migrated ${countOrders} rows PENDING -> MENUNGGU`);
  } else {
    console.log('[orders] no PENDING rows');
  }
  const countHistFrom = await prisma.orderhistory.count({ where: { statusFrom: 'PENDING' as any } });
  if (countHistFrom) {
    await prisma.$executeRawUnsafe(`UPDATE OrderHistory SET statusFrom = 'MENUNGGU' WHERE statusFrom = 'PENDING'`);
    console.log(`[history] statusFrom migrated ${countHistFrom}`);
  }
  const countHistTo = await prisma.orderhistory.count({ where: { statusTo: 'PENDING' as any } });
  if (countHistTo) {
    await prisma.$executeRawUnsafe(`UPDATE OrderHistory SET statusTo = 'MENUNGGU' WHERE statusTo = 'PENDING'`);
    console.log(`[history] statusTo migrated ${countHistTo}`);
  }
  console.log('[migrate-pending-to-menunggu] done');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());