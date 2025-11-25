import { PrismaClient } from '@prisma/client';

// Fallback migration if masih ada record dengan status DITERIMA setelah perubahan enum ke MENUNGGU.
// Jalankan SEBELUM prisma migrate dev jika schema sudah tidak mengandung DITERIMA.
// Usage:
//   npx ts-node src/scripts/migrate-diterima-to-menunggu.ts

const prisma = new PrismaClient();

async function main() {
  console.log('[migrate-diterima-to-menunggu] start');
  const countOrders = await prisma.$queryRawUnsafe<any[]>(`SELECT COUNT(*) as c FROM \`Order\` WHERE status = 'DITERIMA'`);
  const totalOrders = Number(countOrders?.[0]?.c || 0);
  if (totalOrders > 0) {
    await prisma.$executeRawUnsafe(`UPDATE \`Order\` SET status = 'MENUNGGU' WHERE status = 'DITERIMA'`);
    console.log(`[orders] migrated ${totalOrders} rows DITERIMA -> MENUNGGU`);
  } else {
    console.log('[orders] no DITERIMA rows');
  }
  const countHistFrom = await prisma.$queryRawUnsafe<any[]>(`SELECT COUNT(*) as c FROM OrderHistory WHERE statusFrom = 'DITERIMA'`);
  const totalHistFrom = Number(countHistFrom?.[0]?.c || 0);
  if (totalHistFrom > 0) {
    await prisma.$executeRawUnsafe(`UPDATE OrderHistory SET statusFrom = 'MENUNGGU' WHERE statusFrom = 'DITERIMA'`);
    console.log(`[history] statusFrom migrated ${totalHistFrom}`);
  }
  const countHistTo = await prisma.$queryRawUnsafe<any[]>(`SELECT COUNT(*) as c FROM OrderHistory WHERE statusTo = 'DITERIMA'`);
  const totalHistTo = Number(countHistTo?.[0]?.c || 0);
  if (totalHistTo > 0) {
    await prisma.$executeRawUnsafe(`UPDATE OrderHistory SET statusTo = 'MENUNGGU' WHERE statusTo = 'DITERIMA'`);
    console.log(`[history] statusTo migrated ${totalHistTo}`);
  }
  console.log('[migrate-diterima-to-menunggu] done');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());