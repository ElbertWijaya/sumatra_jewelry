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

    for (const u of expected) {
      const existing = await prisma.appUser.findUnique({ where: { email: u.email } });
      if (!existing) {
        const hash = await argon2.hash(u.password || 'Password123!');
        await prisma.appUser.create({ data: { email: u.email, fullName: u.fullName, jobRole: u.jobRole, password: hash } });
        console.log('Created missing user:', u.email);
      } else {
        let needsUpdate = false;
        const updateData: any = {};
        if (existing.fullName !== u.fullName) { updateData.fullName = u.fullName; needsUpdate = true; }
        // jobRole might be null in existing
        if ((existing as any).jobRole !== u.jobRole) { updateData.jobRole = u.jobRole; needsUpdate = true; }
        if (needsUpdate) {
          await prisma.appUser.update({ where: { email: u.email }, data: updateData });
          console.log('Updated user metadata:', u.email, updateData);
        }
      }
    }

    const count = await prisma.appUser.count();
    console.log(`Done. Total users now: ${count}`);
  } catch (err) {
    console.error('Error restoring users', err);
    process.exitCode = 1;
  } finally {
    await (global as any).prisma?.$disconnect?.();
  }
}

main();
