import { IsDateString, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export const ORDER_STATUS_VALUES = ['DRAFT','DITERIMA','DALAM_PROSES','SIAP','DIAMBIL','BATAL'] as const;
export type OrderStatusEnum = typeof ORDER_STATUS_VALUES[number];

export interface RequestUser {
  userId: string;
  jobRole?: string | null;
  email: string;
}

export class CreateOrderDto {
  @IsString() @IsNotEmpty() customerName!: string;
  @IsOptional() @IsString() customerAddress?: string;
  @IsOptional() @IsString() customerPhone?: string;
  @IsString() @IsNotEmpty() jenisBarang!: string;
  @IsString() @IsNotEmpty() jenisEmas!: string;
  @IsString() @IsNotEmpty() warnaEmas!: string;
  // Removed per new spec: kadar, beratTarget, ongkos
  @IsOptional() @IsNumber() @Min(0) dp?: number;
  @IsOptional() @IsDateString() promisedReadyDate?: string; // Tanggal Perkiraan Siap
  @IsOptional() @IsDateString() tanggalSelesai?: string;
  @IsOptional() @IsDateString() tanggalAmbil?: string;
  @IsOptional() @IsString() catatan?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) referensiGambarUrls?: string[]; // multi-image only
  @IsOptional() @IsNumber() hargaEmasPerGram?: number;
  @IsOptional() @IsNumber() hargaPerkiraan?: number;
  @IsOptional() @IsNumber() hargaAkhir?: number;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => StoneDto) stones?: StoneDto[];
}

export class StoneDto {
  @IsString() @IsNotEmpty() bentuk!: string;
  @IsInt() @Min(1) jumlah!: number;
  @IsOptional() @IsNumber() @Min(0) berat?: number;
}

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUS_VALUES) status!: OrderStatusEnum;
}

export class UpdateOrderDto {
  @IsOptional() @IsString() customerName?: string;
  @IsOptional() @IsString() customerAddress?: string;
  @IsOptional() @IsString() customerPhone?: string;
  @IsOptional() @IsString() jenisBarang?: string;
  @IsOptional() @IsString() jenisEmas?: string;
  @IsOptional() @IsString() warnaEmas?: string;
  @IsOptional() @IsNumber() @Min(0) dp?: number;
  @IsOptional() @IsNumber() hargaEmasPerGram?: number;
  @IsOptional() @IsNumber() hargaPerkiraan?: number;
  @IsOptional() @IsNumber() hargaAkhir?: number;
  @IsOptional() @IsDateString() promisedReadyDate?: string;
  @IsOptional() @IsDateString() tanggalSelesai?: string;
  @IsOptional() @IsDateString() tanggalAmbil?: string;
  @IsOptional() @IsString() catatan?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) referensiGambarUrls?: string[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => StoneDto) stones?: StoneDto[];
}
