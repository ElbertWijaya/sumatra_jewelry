import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'Pass123!';
  const hash = await argon2.hash(newPassword);

  const updated = await prisma.account.updateMany({
    data: { password: hash },
  });

  console.log(`Reset password untuk ${updated.count} akun menjadi '${newPassword}'.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
