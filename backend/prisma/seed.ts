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
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
