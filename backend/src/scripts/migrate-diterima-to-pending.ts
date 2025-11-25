import { PrismaClient } from '@prisma/client';

// Migration script: convert existing order + orderhistory status values DITERIMA -> PENDING.
// Run AFTER adding PENDING to enums, BEFORE removing DITERIMA from schema.
// Usage (PowerShell):
//   npx ts-node src/scripts/migrate-diterima-to-pending.ts

const prisma = new PrismaClient();

async function main() {
  console.log('[migrate-diterima-to-pending] start');
  const ordersToUpdate = await prisma.order.count({ where: { status: 'DITERIMA' as any } });
  if (ordersToUpdate) {
    const batchSize = 100;
    let offset = 0;
    while (true) {
      const rows = await prisma.order.findMany({ where: { status: 'DITERIMA' as any }, select: { id: true }, take: batchSize });
      if (!rows.length) break;
      await prisma.$transaction(rows.map(r => prisma.order.update({ where: { id: r.id }, data: { status: 'PENDING' as any } })));
      offset += rows.length;
      console.log(`[orders] migrated ${offset}/${ordersToUpdate}`);
      if (rows.length < batchSize) break;
    }
  }

  const histFrom = await prisma.orderhistory.count({ where: { statusFrom: 'DITERIMA' as any } });
  if (histFrom) {
    await prisma.$executeRawUnsafe(`UPDATE OrderHistory SET statusFrom = 'PENDING' WHERE statusFrom = 'DITERIMA'`);
    console.log(`[history] statusFrom migrated: ${histFrom}`);
  }
  const histTo = await prisma.orderhistory.count({ where: { statusTo: 'DITERIMA' as any } });
  if (histTo) {
    await prisma.$executeRawUnsafe(`UPDATE OrderHistory SET statusTo = 'PENDING' WHERE statusTo = 'DITERIMA'`);
    console.log(`[history] statusTo migrated: ${histTo}`);
  }

  console.log('[migrate-diterima-to-pending] done');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());