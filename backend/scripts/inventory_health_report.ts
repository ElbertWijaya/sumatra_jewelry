/**
 * Inventory Health Report Script
 * Jalankan manual: npx ts-node scripts/inventory_health_report.ts
 * Output: ringkas KPI & anomali untuk monitoring.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const [total, active, reserved, sold, damaged, deleted] = await Promise.all([
    prisma.inventoryItem.count(),
    prisma.inventoryItem.count({ where: { statusEnum: 'ACTIVE', isDeleted: false } }),
    prisma.inventoryItem.count({ where: { statusEnum: 'RESERVED', isDeleted: false } }),
    prisma.inventoryItem.count({ where: { statusEnum: 'SOLD', isDeleted: false } }),
    prisma.inventoryItem.count({ where: { statusEnum: 'DAMAGED', isDeleted: false } }),
    prisma.inventoryItem.count({ where: { isDeleted: true } }),
  ]);

  // Anomali: berat_net > berat_gross, stone_count mismatch stones, missing images (if images required)
  const overweight = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, weight_gross, weight_net FROM inventoryitem WHERE weight_net IS NOT NULL AND weight_gross IS NOT NULL AND weight_net > weight_gross LIMIT 50`
  );
  const noImages = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, code FROM inventoryitem WHERE (images IS NULL OR images = '[]') AND is_deleted = 0 LIMIT 50`
  );

  // Items with stones where aggregate differs
  const stoneMismatch = await prisma.$queryRawUnsafe<any[]>(
    `SELECT i.id, i.stone_count, SUM(s.jumlah) agg_jumlah
     FROM inventoryitem i
     JOIN inventorystone s ON s.inventoryItemId = i.id
     GROUP BY i.id
     HAVING i.stone_count IS NOT NULL AND i.stone_count != agg_jumlah
     LIMIT 50`
  );

  // Distribution by branch & placement
  const byBranch = await prisma.$queryRawUnsafe<any[]>(
    `SELECT branch_location, COUNT(*) cnt FROM inventoryitem WHERE is_deleted = 0 GROUP BY branch_location`
  );
  const byPlacement = await prisma.$queryRawUnsafe<any[]>(
    `SELECT placement_location, COUNT(*) cnt FROM inventoryitem WHERE is_deleted = 0 GROUP BY placement_location`
  );

  const report = {
    timestamp: new Date().toISOString(),
    totals: { total, active, reserved, sold, damaged, deleted },
    distribution: { byBranch, byPlacement },
    anomalies: {
      overweightCount: overweight.length,
      overweightSamples: overweight,
      noImagesCount: noImages.length,
      noImagesSamples: noImages,
      stoneMismatchCount: stoneMismatch.length,
      stoneMismatchSamples: stoneMismatch,
    },
  };
  console.log(JSON.stringify(report, null, 2));
}

main().finally(() => prisma.$disconnect());
