import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import dayjs from 'dayjs';

import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderStatusEnum } from '../types/order.dtos';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId: string) {
    if (dto.dp && dto.ongkos && Number(dto.dp) > Number(dto.ongkos)) {
      throw new BadRequestException('DP tidak boleh lebih besar dari ongkos');
    }
    const order = await this.prisma.order.create({
      data: {
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        jenis: dto.jenis,
        kadar: dto.kadar,
        beratTarget: dto.beratTarget ? dto.beratTarget : undefined,
        ongkos: dto.ongkos,
        dp: dto.dp || 0,
        tanggalJanjiJadi: dto.tanggalJanjiJadi ? new Date(dto.tanggalJanjiJadi) : undefined,
        catatan: dto.catatan,
        status: 'DRAFT',
        createdById: userId,
        updatedById: userId,
      },
    });
    // generate code after id known: TM-YYYYMM-XXXX
    const code = `TM-${dayjs(order.createdAt).format('YYYYMM')}-${String(order.id).padStart(4, '0')}`;
    await this.prisma.order.update({ where: { id: order.id }, data: { code } });
    return this.findById(order.id);
  }

  async findAll(params: { status?: OrderStatusEnum }) {
    return this.prisma.order.findMany({
      where: params.status ? { status: params.status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order tidak ditemukan');
    return order;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto, userId: string) {
    const order = await this.findById(id);
    const allowed: Record<OrderStatusEnum, OrderStatusEnum[]> = {
      DRAFT: ['DITERIMA', 'BATAL'],
      DITERIMA: ['DALAM_PROSES', 'BATAL'],
      DALAM_PROSES: ['SIAP', 'BATAL'],
      SIAP: ['DIAMBIL', 'BATAL'],
      DIAMBIL: [],
      BATAL: [],
    };
    if (!allowed[order.status].includes(dto.status)) {
      throw new BadRequestException('Transition status tidak valid');
    }
    if (dto.status === 'SIAP' && dto.beratAkhir == null) {
      throw new BadRequestException('Berat akhir wajib saat set SIAP');
    }
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
        beratAkhir: dto.beratAkhir ?? order.beratAkhir,
        updatedById: userId,
      },
    });
    await this.prisma.orderHistory.create({
      data: {
        orderId: id,
        userId,
        changeSummary: `STATUS: ${order.status} -> ${dto.status}`,
        diff: { from: order.status, to: dto.status },
      },
    });
    return updated;
  }

  async history(id: number) {
    // Ensure order exists (throws if not)
    await this.findById(id);
    const records = await this.prisma.orderHistory.findMany({
      where: { orderId: id },
      include: { user: { select: { id: true, fullName: true, role: true } } },
      orderBy: { changedAt: 'asc' }
    });
    return records.map(r => ({
      id: r.id,
      changedAt: r.changedAt,
      by: r.user ? { id: r.user.id, fullName: r.user.fullName, role: r.user.role } : null,
      summary: r.changeSummary,
      diff: r.diff
    }));
  }
}
