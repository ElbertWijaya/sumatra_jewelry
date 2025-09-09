export declare const ORDER_STATUS_VALUES: readonly ["DRAFT", "DITERIMA", "DALAM_PROSES", "SIAP", "DIAMBIL", "BATAL"];
export type OrderStatusEnum = typeof ORDER_STATUS_VALUES[number];
export interface RequestUser {
    userId: string;
    jobRole?: string | null;
    email: string;
}
export declare class CreateOrderDto {
    customerName: string;
    customerAddress?: string;
    customerPhone?: string;
    jenisBarang: string;
    jenisEmas: string;
    warnaEmas: string;
    dp?: number;
    promisedReadyDate?: string;
    tanggalSelesai?: string;
    tanggalAmbil?: string;
    catatan?: string;
    referensiGambarUrls?: string[];
    hargaEmasPerGram?: number;
    hargaPerkiraan?: number;
    hargaAkhir?: number;
    stones?: StoneDto[];
}
export declare class StoneDto {
    bentuk: string;
    jumlah: number;
    berat?: number;
}
export declare class UpdateOrderStatusDto {
    status: OrderStatusEnum;
}
export declare class UpdateOrderDto {
    customerName?: string;
    customerAddress?: string;
    customerPhone?: string;
    jenisBarang?: string;
    jenisEmas?: string;
    warnaEmas?: string;
    dp?: number;
    hargaEmasPerGram?: number;
    hargaPerkiraan?: number;
    hargaAkhir?: number;
    promisedReadyDate?: string;
    tanggalSelesai?: string;
    tanggalAmbil?: string;
    catatan?: string;
    referensiGambarUrls?: string[];
    stones?: StoneDto[];
}
