import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

/**
 * This script re-seeds the default application users if the table is empty (or missing some expected emails).
 * It is SAFE to run multiple times; it only inserts missing users and updates names / roles if changed.
 */
async function main() {
  const prisma = new PrismaClient();
  try {
    const expected: Array<{ email: string; fullName: string; jobRole: any; password?: string }> = [
      { email: 'admin@tokomas.local', fullName: 'Aceng', jobRole: 'ADMINISTRATOR', password: 'Admin123!' },
      { email: 'sales@tokomas.local', fullName: 'Yanti', jobRole: 'SALES', password: 'Password123!' },
      { email: 'designer@tokomas.local', fullName: 'Elbert Wijaya', jobRole: 'DESIGNER', password: 'Password123!' },
      { email: 'carver@tokomas.local', fullName: 'Acai', jobRole: 'CARVER', password: 'Password123!' },
      { email: 'caster@tokomas.local', fullName: 'Hanpin', jobRole: 'CASTER', password: 'Password123!' },
      { email: 'diamond@tokomas.local', fullName: 'Yanti Atas', jobRole: 'DIAMOND_SETTER', password: 'Password123!' },
      { email: 'finisher@tokomas.local', fullName: 'Ayu', jobRole: 'FINISHER', password: 'Password123!' },
      { email: 'inventory@tokomas.local', fullName: 'Suk Mai D', jobRole: 'INVENTORY', password: 'Password123!' },
    ];

    const defaultBranch = await prisma.branch.findFirst();
    if (!defaultBranch) throw new Error('Branch belum tersedia, hubungi admin.');
    for (const u of expected) {
      const existing = await prisma.account.findUnique({ where: { email: u.email } });
      if (!existing) {
        const hash = await argon2.hash(u.password || 'Password123!');
        await prisma.account.create({
          data: {
            email: u.email,
            fullName: u.fullName,
            job_role: u.jobRole || '',
            password: hash,
            branch: { connect: { id: defaultBranch.id } }
          }
        });
        console.log('Created missing user:', u.email);
      } else {
        let needsUpdate = false;
        const updateData: any = {};
        if (existing.fullName !== u.fullName) { updateData.fullName = u.fullName; needsUpdate = true; }
        // job_role might be null in existing
        if ((existing as any).job_role !== u.jobRole) { updateData.job_role = u.jobRole; needsUpdate = true; }
        if (needsUpdate) {
          await prisma.account.update({ where: { email: u.email }, data: updateData });
          console.log('Updated user metadata:', u.email, updateData);
        }
      }
    }

  const count = await prisma.account.count();
    console.log(`Done. Total users now: ${count}`);
  } catch (err) {
    console.error('Error restoring users', err);
    process.exitCode = 1;
  } finally {
    await (global as any).prisma?.$disconnect?.();
  }
}

main();
