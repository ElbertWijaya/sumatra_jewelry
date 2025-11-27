import { PrismaClient } from '@prisma/client';

// Backfill karat from inventorystone total berat (ct) for items where karat is NULL or empty
async function main() {
  const prisma = new PrismaClient();
  try {
    const items = await prisma.inventoryitem.findMany({ select: { id: true, karat: true } });
    let updated = 0;
    for (const it of items) {
      if (it.karat && it.karat.trim() !== '') continue;
      const stones = await prisma.inventorystone.findMany({ where: { inventoryItemId: it.id }, select: { berat: true } });
      if (!stones.length) continue;
      const totalCt = stones.reduce((sum, s) => sum + (s.berat ? Number(s.berat) : 0), 0);
      await prisma.inventoryitem.update({ where: { id: it.id }, data: { karat: String(totalCt) } });
      updated++;
    }
    console.log(`Backfill complete. Updated ${updated} items.`);
  } catch (e) {
    console.error('Backfill failed:', e);
    process.exitCode = 1;
  } finally {
    await (prisma as any).$disconnect();
  }
}

main();
