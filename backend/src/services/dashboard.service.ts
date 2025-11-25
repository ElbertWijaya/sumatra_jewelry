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
      // Aktif: status berjalan (tanpa DRAFT yang sudah dihapus)
      this.prisma.order.count({ where: { status: { in: ['DITERIMA', 'DALAM_PROSES'] } } }),
      // Ditugaskan: memiliki minimal satu task
      this.prisma.order.count({ where: { ordertask: { some: {} } } }),
      // Selesai hari ini: status final SIAP / DIAMBIL dan diupdate hari ini
      this.prisma.order.count({ where: { status: { in: ['SIAP', 'DIAMBIL'] }, updated_at: { gte: startOfDay, lt: endOfDay } } }),
      // Verifikasi: ada task menunggu validasi
      this.prisma.order.count({ where: { ordertask: { some: { status: 'AWAITING_VALIDATION' } } } }),
    ]);

    // Get daily changes (today vs yesterday)
    const [aktifToday, ditugaskanToday, selesaiToday, verifikasiToday] = await Promise.all([
      this.prisma.order.count({ where: { status: { in: ['DITERIMA', 'DALAM_PROSES'] }, updated_at: { gte: startOfDay, lt: endOfDay } } }),
      this.prisma.order.count({ where: { ordertask: { some: {} }, updated_at: { gte: startOfDay, lt: endOfDay } } }),
      this.prisma.order.count({ where: { status: { in: ['SIAP', 'DIAMBIL'] }, updated_at: { gte: startOfDay, lt: endOfDay } } }),
      this.prisma.order.count({ where: { ordertask: { some: { status: 'AWAITING_VALIDATION', updated_at: { gte: startOfDay, lt: endOfDay } } } } }),
    ]);

    const [aktifYesterday, ditugaskanYesterday, selesaiYesterday, verifikasiYesterday] = await Promise.all([
      this.prisma.order.count({ where: { status: { in: ['DITERIMA', 'DALAM_PROSES'] }, updated_at: { gte: startOfYesterday, lt: endOfYesterday } } }),
      this.prisma.order.count({ where: { ordertask: { some: {} }, updated_at: { gte: startOfYesterday, lt: endOfYesterday } } }),
      this.prisma.order.count({ where: { status: { in: ['SIAP', 'DIAMBIL'] }, updated_at: { gte: startOfYesterday, lt: endOfYesterday } } }),
      this.prisma.order.count({ where: { ordertask: { some: { status: 'AWAITING_VALIDATION', updated_at: { gte: startOfYesterday, lt: endOfYesterday } } } } }),
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
