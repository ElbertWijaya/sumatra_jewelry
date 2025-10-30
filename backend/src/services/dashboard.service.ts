import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Get yesterday's date range for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);

    // Count orders by status
    const [aktif, ditugaskan, selesai, verifikasi] = await Promise.all([
      // Aktif: Pesanan baru yang belum ditugaskan ke role manapun (DRAFT atau DITERIMA tanpa tasks assigned)
      this.prisma.order.count({
        where: {
          status: { in: ['DRAFT', 'DITERIMA'] },
          tasks: { none: {} } // No tasks assigned
        }
      }),

      // Ditugaskan: Pesanan yang sudah ditugaskan ke role lainnya (sudah ada tasks assigned)
      this.prisma.order.count({
        where: {
          tasks: { some: {} } // Has at least one task assigned
        }
      }),

      // Selesai: Pesanan yang sudah selesai di hari tersebut (SIAP atau DIAMBIL, updatedAt hari ini)
      this.prisma.order.count({
        where: {
          status: { in: ['SIAP', 'DIAMBIL'] },
          updatedAt: { gte: startOfDay, lt: endOfDay }
        }
      }),

      // Verifikasi: Pesanan yang membutuhkan verifikasi (tasks with AWAITING_VALIDATION)
      this.prisma.order.count({
        where: {
          tasks: {
            some: {
              status: 'AWAITING_VALIDATION'
            }
          }
        }
      }),
    ]);

    // Get daily changes (today vs yesterday)
    const [aktifToday, ditugaskanToday, selesaiToday, verifikasiToday] = await Promise.all([
      this.prisma.order.count({
        where: {
          status: { in: ['DRAFT', 'DITERIMA'] },
          tasks: { none: {} },
          updatedAt: { gte: startOfDay, lt: endOfDay }
        }
      }),
      this.prisma.order.count({
        where: {
          tasks: { some: {} },
          updatedAt: { gte: startOfDay, lt: endOfDay }
        }
      }),
      this.prisma.order.count({
        where: {
          status: { in: ['SIAP', 'DIAMBIL'] },
          updatedAt: { gte: startOfDay, lt: endOfDay }
        }
      }),
      this.prisma.order.count({
        where: {
          tasks: {
            some: {
              status: 'AWAITING_VALIDATION',
              updatedAt: { gte: startOfDay, lt: endOfDay }
            }
          }
        }
      }),
    ]);

    const [aktifYesterday, ditugaskanYesterday, selesaiYesterday, verifikasiYesterday] = await Promise.all([
      this.prisma.order.count({
        where: {
          status: { in: ['DRAFT', 'DITERIMA'] },
          tasks: { none: {} },
          updatedAt: { gte: startOfYesterday, lt: endOfYesterday }
        }
      }),
      this.prisma.order.count({
        where: {
          tasks: { some: {} },
          updatedAt: { gte: startOfYesterday, lt: endOfYesterday }
        }
      }),
      this.prisma.order.count({
        where: {
          status: { in: ['SIAP', 'DIAMBIL'] },
          updatedAt: { gte: startOfYesterday, lt: endOfYesterday }
        }
      }),
      this.prisma.order.count({
        where: {
          tasks: {
            some: {
              status: 'AWAITING_VALIDATION',
              updatedAt: { gte: startOfYesterday, lt: endOfYesterday }
            }
          }
        }
      }),
    ]);

    return {
      aktif: {
        count: aktif,
        change: aktifToday - aktifYesterday
      },
      ditugaskan: {
        count: ditugaskan,
        change: ditugaskanToday - ditugaskanYesterday
      },
      selesai: {
        count: selesai,
        change: selesaiToday - selesaiYesterday
      },
      verifikasi: {
        count: verifikasi,
        change: verifikasiToday - verifikasiYesterday
      }
    };
  }
}
