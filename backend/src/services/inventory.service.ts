import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto, UpdateInventoryDto } from '../types/inventory.dtos';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInventoryDto, actorUserId?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    const data: any = {
      orderId: dto.orderId,
      code: dto.code ?? null,
      name: dto.name ?? null,
      category: dto.category ?? null,
      material: dto.material ?? null,
      karat: dto.karat ?? null,
      goldType: dto.goldType ?? null,
      goldColor: dto.goldColor ?? null,
      weightGross: dto.weightGross != null ? Number(dto.weightGross) : null,
      weightNet: dto.weightNet != null ? Number(dto.weightNet) : null,
      stoneCount: dto.stoneCount != null ? Number(dto.stoneCount) : null,
      stoneWeight: dto.stoneWeight != null ? Number(dto.stoneWeight) : null,
      size: dto.size ?? null,
      dimensions: dto.dimensions ?? null,
      barcode: dto.barcode ?? null,
      sku: dto.sku ?? null,
      location: dto.location ?? null,
      cost: dto.cost != null ? Number(dto.cost) : null,
      price: dto.price != null ? Number(dto.price) : null,
      status: dto.status ?? 'IN_STOCK',
      images: Array.isArray(dto.images) ? dto.images : undefined,
      notes: dto.notes ?? null,
      createdById: actorUserId ?? null,
      updatedById: actorUserId ?? null,
    };
    try {
      return (this.prisma as any).inventoryItem.create({ data });
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Gagal membuat inventory');
    }
  }

  async update(id: number, dto: UpdateInventoryDto, actorUserId?: string) {
    const exists = await (this.prisma as any).inventoryItem.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Inventory tidak ditemukan');
    const data: any = {
      ...dto,
      weightGross: dto.weightGross != null ? Number(dto.weightGross) : undefined,
      weightNet: dto.weightNet != null ? Number(dto.weightNet) : undefined,
      stoneCount: dto.stoneCount != null ? Number(dto.stoneCount) : undefined,
      stoneWeight: dto.stoneWeight != null ? Number(dto.stoneWeight) : undefined,
      cost: dto.cost != null ? Number(dto.cost) : undefined,
      price: dto.price != null ? Number(dto.price) : undefined,
      updatedById: actorUserId ?? undefined,
    };
    try {
      return (this.prisma as any).inventoryItem.update({ where: { id }, data });
    } catch (e: any) {
      throw new BadRequestException(e?.message || 'Gagal update inventory');
    }
  }

  get(id: number) {
    return (this.prisma as any).inventoryItem.findUnique({ where: { id } });
  }

  listByOrder(orderId: number) {
    return (this.prisma as any).inventoryItem.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  }
}
