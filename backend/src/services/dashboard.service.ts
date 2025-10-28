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
    const [aktif, ditugaskan, selesai, pending] = await Promise.all([
      // Aktif: DALAM_PROSES (actively being worked on)
      this.prisma.order.count({ where: { status: 'DALAM_PROSES' } }),

      // Ditugaskan: orders with assigned tasks (OPEN or IN_PROGRESS tasks)
      this.prisma.order.count({
        where: {
          tasks: {
            some: {
              status: { in: ['OPEN', 'IN_PROGRESS'] }
            }
          }
        }
      }),

      // Selesai: SIAP or DIAMBIL
      this.prisma.order.count({ where: { status: { in: ['SIAP', 'DIAMBIL'] } } }),

      // Pending: DRAFT or DITERIMA (waiting to be processed)
      this.prisma.order.count({ where: { status: { in: ['DRAFT', 'DITERIMA'] } } }),
    ]);

    // Get daily changes (today vs yesterday)
    const [aktifToday, ditugaskanToday, selesaiToday, pendingToday] = await Promise.all([
      this.prisma.order.count({
        where: {
          status: 'DALAM_PROSES',
          updatedAt: { gte: startOfDay, lt: endOfDay }
        }
      }),
      this.prisma.order.count({
        where: {
          tasks: {
            some: {
              status: { in: ['OPEN', 'IN_PROGRESS'] },
              updatedAt: { gte: startOfDay, lt: endOfDay }
            }
          }
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
          status: { in: ['DRAFT', 'DITERIMA'] },
          updatedAt: { gte: startOfDay, lt: endOfDay }
        }
      }),
    ]);

    const [aktifYesterday, ditugaskanYesterday, selesaiYesterday, pendingYesterday] = await Promise.all([
      this.prisma.order.count({
        where: {
          status: 'DALAM_PROSES',
          updatedAt: { gte: startOfYesterday, lt: endOfYesterday }
        }
      }),
      this.prisma.order.count({
        where: {
          tasks: {
            some: {
              status: { in: ['OPEN', 'IN_PROGRESS'] },
              updatedAt: { gte: startOfYesterday, lt: endOfYesterday }
            }
          }
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
          status: { in: ['DRAFT', 'DITERIMA'] },
          updatedAt: { gte: startOfYesterday, lt: endOfYesterday }
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
      pending: {
        count: pending,
        change: pendingToday - pendingYesterday
      }
    };
  }
}
