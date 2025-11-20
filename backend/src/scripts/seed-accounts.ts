import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

async function main() {
  const prisma = new PrismaClient();
  try {
    // Ensure branches exist
    const branchesSeed = [
      { name: 'ASIA', address: 'ASIA Branch' },
      { name: 'SUN_PLAZA', address: 'SUN PLAZA Branch' },
    ];
    for (const b of branchesSeed) {
      const existing = await prisma.branch.findFirst({ where: { name: b.name } });
      if (!existing) {
        await prisma.branch.create({ data: b });
        console.log('Created branch:', b.name);
      }
    }
    const defaultBranch = await prisma.branch.findFirst({ orderBy: { id: 'asc' } });
    if (!defaultBranch) throw new Error('Failed creating default branch');

    const roles = [
      'ADMINISTRATOR',
      'SALES',
      'DESIGNER',
      'CASTER',
      'CARVER',
      'DIAMOND_SETTER',
      'FINISHER',
      'INVENTORY',
    ] as const;

    const password = 'Password123!';
    const hash = await argon2.hash(password);
    console.log('argon2 hash for Password123! =>', hash);

    for (const role of roles) {
      const email = `${role.toLowerCase()}@tokomas.local`;
      const fullName = role
        .toLowerCase()
        .split('_')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');

      const existing = await prisma.account.findUnique({ where: { email } });
      if (!existing) {
        await prisma.account.create({
          data: {
            email,
            fullName,
            job_role: role,
            password: hash,
            branch: { connect: { id: defaultBranch.id } },
          },
        });
        console.log('Created account:', email, 'role:', role);
      } else {
        // Ensure role/name up to date
        const updates: any = {};
        let need = false;
        if (existing.job_role !== role) {
          updates.job_role = role;
          need = true;
        }
        if (existing.fullName !== fullName) {
          updates.fullName = fullName;
          need = true;
        }
        if (need) {
          await prisma.account.update({ where: { email }, data: updates });
          console.log('Updated account metadata:', email, updates);
        } else {
          console.log('Account exists:', email);
        }
      }
    }

    console.log('Seeding complete. You can login with any email above and password Password123!.');
  } catch (e) {
    console.error('Seeding error:', e);
    process.exitCode = 1;
  } finally {
    await (global as any).prisma?.$disconnect?.();
  }
}

main();
