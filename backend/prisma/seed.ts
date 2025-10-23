import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // Insert branch jika belum ada
  const branchesToSeed = [
    { name: 'Asia', address: 'Jl. Asia No.170 B, Sei Rengas II, Kec. Medan Area, Kota Medan, Sumatera Utara 20211' },
    { name: 'Sun Plaza', address: 'Mall Jl. KH. Zainul Arifin No.7, Madras Hulu, Kec. Medan Polonia, Kota Medan, Sumatera Utara 20152' }
  ];
  for (const b of branchesToSeed) {
    const exists = await prisma.branch.findFirst({ where: { name: b.name } });
    if (!exists) {
      await prisma.branch.create({ data: b });
      console.log(`Branch seeded: ${b.name}`);
    }
  }
  const adminEmail = 'admin@tokomas.local';
  const defaultBranch = await prisma.branch.findFirst();
  if (!defaultBranch) throw new Error('Branch belum tersedia, hubungi admin.');

  const exists = await prisma.account.findUnique({ where: { email: adminEmail } });
  if (!exists) {
    const hash = await argon2.hash('Admin123!');
    await prisma.account.create({
      data: { email: adminEmail, fullName: 'Aceng', job_role: 'ADMINISTRATOR', password: hash, branch: { connect: { id: defaultBranch.id } } },
    });
    console.log('Seeded admin user: admin@tokomas.local / Admin123! (Aceng)');
  } else {
    if (exists.fullName !== 'Aceng') {
      await prisma.account.update({ where: { email: adminEmail }, data: { fullName: 'Aceng' } });
      console.log('Updated admin fullName to Aceng');
    } else {
      console.log('Admin user already exists.');
    }
  }

  // Sales (kasir) account
  type JobRole = 'ADMINISTRATOR'|'SALES'|'DESIGNER'|'CASTER'|'CARVER'|'DIAMOND_SETTER'|'FINISHER'|'INVENTORY';
  const usersToSeed: Array<{ email: string; fullName: string; jobRole?: JobRole }> = [
    { email: 'sales@tokomas.local', fullName: 'Yanti', jobRole: 'SALES' },
    { email: 'designer@tokomas.local', fullName: 'Elbert Wijaya', jobRole: 'DESIGNER' },
    { email: 'carver@tokomas.local', fullName: 'Acai', jobRole: 'CARVER' },
    { email: 'caster@tokomas.local', fullName: 'Hanpin', jobRole: 'CASTER' },
    { email: 'diamond@tokomas.local', fullName: 'Yanti Atas', jobRole: 'DIAMOND_SETTER' },
    { email: 'finisher@tokomas.local', fullName: 'Ayu', jobRole: 'FINISHER' },
    { email: 'inventory@tokomas.local', fullName: 'Suk Mai D', jobRole: 'INVENTORY' },
  ];

  for (const u of usersToSeed) {
    const existU = await prisma.account.findUnique({ where: { email: u.email } });
    if (!existU) {
      const hash = await argon2.hash('Password123!');
      await prisma.account.create({
        data: {
          email: u.email,
          fullName: u.fullName,
          job_role: u.jobRole || '',
          password: hash,
          branch: { connect: { id: defaultBranch.id } }
        }
      });
      console.log(`Seeded user: ${u.email} / Password123!`);
    } else {
      // ensure job_role up to date if missing
      if (u.jobRole && (existU as any).job_role !== u.jobRole) {
        await prisma.account.update({ where: { email: u.email }, data: { job_role: u.jobRole } });
        console.log(`Updated job_role for ${u.email} -> ${u.jobRole}`);
      }
      if (existU.fullName !== u.fullName) {
        await prisma.account.update({ where: { email: u.email }, data: { fullName: u.fullName } });
        console.log(`Updated fullName for ${u.email} -> ${u.fullName}`);
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
