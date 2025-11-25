import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[migrate] Converting DRAFT orders to DITERIMA...');
  const drafts = await prisma.order.findMany({ where: { status: 'DRAFT' }, select: { id: true, code: true } });
  if (!drafts.length) { console.log('[migrate] No DRAFT orders found.'); return; }
  const actor = await prisma.account.findFirst({ select: { id: true, fullName: true, job_role: true } });
  const userId = actor?.id || null;

  await prisma.$transaction(drafts.map(d => prisma.order.update({ where: { id: d.id }, data: { status: 'DITERIMA' as any } })));
  // History logs (non-transactional best-effort)
  for (const d of drafts) {
    try {
      await prisma.orderhistory.create({
        data: {
          orderId: d.id,
          userId,
          action: 'STATUS_CHANGED',
          actorName: actor?.fullName ?? null,
          actorRole: (actor as any)?.job_role ?? null,
          statusFrom: 'DRAFT' as any,
          statusTo: 'DITERIMA' as any,
          orderCode: d.code ?? null,
          changeSummary: 'STATUS: DRAFT -> DITERIMA (migration)',
          diff: JSON.stringify({ from: 'DRAFT', to: 'DITERIMA' }),
        } as any,
      });
    } catch {}
  }
  console.log(`[migrate] Updated ${drafts.length} orders.`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(()=> prisma.$disconnect());
