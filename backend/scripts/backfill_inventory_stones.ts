/**
 * Backfill script (placeholder) to migrate legacy `dimensions` data on inventory items
 * into the new `inventorystone` table. Run manually after reviewing parsing logic.
 *
 * Expected legacy format examples (adjust as needed):
 *  - JSON array: [{ "bentuk": "Round", "jumlah": 4, "berat": 0.12 }, ...]
 *  - JSON object with key per bentuk: { "Round": { "jumlah": 4, "berat": 0.12 } }
 * If format differs, update the `parseDimensions` function accordingly.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ParsedStone = { bentuk: string; jumlah: number; berat?: number | null };

function parseDimensions(raw: string | null | undefined): ParsedStone[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data
        .filter(x => x && typeof x === 'object')
        .map(x => ({
          bentuk: String(x.bentuk ?? x.shape ?? 'UNKNOWN'),
          jumlah: Number(x.jumlah ?? x.count ?? 0),
          berat: x.berat != null ? Number(x.berat) : (x.weight != null ? Number(x.weight) : null),
        }))
        .filter(s => s.jumlah > 0 || (s.berat != null && !isNaN(s.berat)));
    }
    if (data && typeof data === 'object') {
      return Object.entries(data).map(([key, val]: [string, any]) => ({
        bentuk: key,
        jumlah: Number(val?.jumlah ?? val?.count ?? 0),
        berat: val?.berat != null ? Number(val.berat) : (val?.weight != null ? Number(val.weight) : null),
      })).filter(s => s.jumlah > 0 || (s.berat != null && !isNaN(s.berat)));
    }
  } catch {
    return [];
  }
  return [];
}

async function main() {
  const legacy = await prisma.inventoryItem.findMany({
    where: { dimensions: { not: null } },
    select: { id: true, dimensions: true, inventorystone: true },
  });
  let processed = 0;
  for (const item of legacy) {
    if (item.inventorystone.length) continue; // already migrated
    const stones = parseDimensions(item.dimensions);
    if (!stones.length) continue;
    await prisma.inventoryItem.update({
      where: { id: item.id },
      data: {
        inventorystone: {
          create: stones.map(s => ({ bentuk: s.bentuk, jumlah: s.jumlah, berat: s.berat ?? null })),
        },
        stoneCount: stones.reduce((sum, s) => sum + s.jumlah, 0),
        stoneWeight: stones.reduce((sum, s) => sum + (s.berat ? s.berat : 0), 0) || null,
      },
    });
    processed++;
  }
  console.log({ totalCandidates: legacy.length, processed });
}

main().finally(() => prisma.$disconnect());
