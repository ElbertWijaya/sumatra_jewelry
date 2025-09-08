import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@tokomas.local';
  const exists = await prisma.appUser.findUnique({ where: { email: adminEmail } });
  if (!exists) {
    const hash = await argon2.hash('Admin123!');
    await prisma.appUser.create({
      data: { email: adminEmail, fullName: 'Admin', role: Role.admin, password: hash },
    });
    console.log('Seeded admin user: admin@tokomas.local / Admin123!');
  } else {
    console.log('Admin user already exists.');
  }

  // Sales (kasir) account
  type JobRole = 'DESIGNER'|'CASTER'|'CARVER'|'DIAMOND_SETTER'|'FINISHER'|'INVENTORY';
  const usersToSeed: Array<{ email: string; fullName: string; role: Role; jobRole?: JobRole }> = [
    { email: 'sales@tokomas.local', fullName: 'Sales', role: Role.kasir },
    { email: 'designer@tokomas.local', fullName: 'Designer', role: Role.pengrajin, jobRole: 'DESIGNER' },
    { email: 'carver@tokomas.local', fullName: 'Carver', role: Role.pengrajin, jobRole: 'CARVER' },
    { email: 'caster@tokomas.local', fullName: 'Caster', role: Role.pengrajin, jobRole: 'CASTER' },
    { email: 'diamond@tokomas.local', fullName: 'Diamond Setter', role: Role.pengrajin, jobRole: 'DIAMOND_SETTER' },
    { email: 'finisher@tokomas.local', fullName: 'Finisher', role: Role.pengrajin, jobRole: 'FINISHER' },
    { email: 'inventory@tokomas.local', fullName: 'Inventory', role: Role.kasir, jobRole: 'INVENTORY' },
  ];

  for (const u of usersToSeed) {
    const existU = await prisma.appUser.findUnique({ where: { email: u.email } });
    if (!existU) {
      const hash = await argon2.hash('Password123!');
  await (prisma as any).appUser.create({ data: { email: u.email, fullName: u.fullName, role: u.role, jobRole: u.jobRole, password: hash } });
      console.log(`Seeded user: ${u.email} / Password123!`);
    } else {
  // ensure jobRole up to date if missing
      if (u.jobRole && (existU as any).jobRole !== u.jobRole) {
  await (prisma as any).appUser.update({ where: { email: u.email }, data: { jobRole: u.jobRole } });
        console.log(`Updated jobRole for ${u.email} -> ${u.jobRole}`);
      }
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
