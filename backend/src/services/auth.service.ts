import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async validateUser(email: string, password: string) {
  const user = await this.prisma.account.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const hash = user.password || '';
    let match = false;
    // Detect hash type and verify accordingly; fallback attempts for safety
    try {
      if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
        match = await bcrypt.compare(password, hash);
      } else {
        match = await argon2.verify(hash, password);
      }
    } catch {
      // Fallback: try the other algorithm in case detection failed
      try { match = await bcrypt.compare(password, hash); } catch {}
      if (!match) {
        try { match = await argon2.verify(hash, password); } catch {}
      }
    }
    if (!match) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(email: string, password: string) {
  const user = await this.validateUser(email, password);
  const fullUser = await this.prisma.account.findUnique({
    where: { id: user.id },
    include: { branch: { select: { name: true, address: true } } }
  });
  if (!fullUser) throw new UnauthorizedException('User not found');
  const payload = { sub: fullUser.id, jobRole: fullUser.job_role ?? null, email: fullUser.email };
    const accessToken = await this.jwt.signAsync(payload);
    // DEBUG: print token to terminal (hapus setelah selesai)
  console.log('[LOGIN] user:', fullUser.email, 'job_role:', fullUser.job_role, 'token:', accessToken);
    return {
      accessToken,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        fullName: fullUser.fullName,
        job_role: fullUser.job_role ?? null,
        phone: fullUser.phone ?? null,
        address: fullUser.address ?? null,
        branch_id: fullUser.branch_id ?? null,
        branchName: fullUser.branch?.name ?? null,
        branchAddress: fullUser.branch?.address ?? null,
        joinedAt: fullUser.created_at ?? null,
      },
    };
  }

  async register(data: { email: string; password: string; fullName: string; jobRole?: string | null }) {
    const hash = await argon2.hash(data.password);
    // Ambil branch default (pertama) jika tidak diberikan
    const defaultBranch = await this.prisma.branch.findFirst();
    if (!defaultBranch) throw new UnauthorizedException('Branch belum tersedia, hubungi admin.');
    const user = await this.prisma.account.create({
      data: {
        email: data.email,
        password: hash,
        fullName: data.fullName,
        job_role: (data as any).jobRole,
        branch: { connect: { id: defaultBranch.id } }
      },
    });
    return { id: user.id, email: user.email };
  }
}
