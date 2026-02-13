import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';

async function main() {
  const [emailArg, passwordArg] = process.argv.slice(2);
  if (!emailArg || !passwordArg) {
    console.error('Usage: ts-node src/scripts/check-password.ts <email> <password>');
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.account.findUnique({ where: { email: emailArg } });
    if (!user) {
      console.error('User not found for email:', emailArg);
      process.exitCode = 1;
      return;
    }

    const hash = user.password || '';
    let match = false;
    let algo = 'argon2';

    try {
      if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
        algo = 'bcrypt';
        match = await bcrypt.compare(passwordArg, hash);
      } else {
        algo = 'argon2';
        match = await argon2.verify(hash, passwordArg);
      }
    } catch (e) {
      // Fallback attempts if detection failed
      try {
        algo = 'bcrypt';
        match = await bcrypt.compare(passwordArg, hash);
      } catch {}
      if (!match) {
        try {
          algo = 'argon2';
          match = await argon2.verify(hash, passwordArg);
        } catch {}
      }
    }

    if (match) {
      console.log('[OK] Password matches (algo:', algo + ').');
      process.exitCode = 0;
    } else {
      console.log('[FAIL] Password does NOT match.');
      process.exitCode = 2;
    }
  } catch (e) {
    console.error('Error verifying password:', e);
    process.exitCode = 1;
  } finally {
    await (global as any).prisma?.$disconnect?.();
  }
}

main();
