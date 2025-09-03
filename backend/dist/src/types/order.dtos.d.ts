export declare const ORDER_STATUS_VALUES: readonly ["DRAFT", "DITERIMA", "DALAM_PROSES", "SIAP", "DIAMBIL", "BATAL"];
export type OrderStatusEnum = typeof ORDER_STATUS_VALUES[number];
export interface RequestUser {
    userId: string;
    role: string;
    email: string;
}
export declare class CreateOrderDto {
    customerName: string;
    customerAddress?: string;
    customerPhone?: string;
    jenisBarang: string;
    jenisEmas: string;
    warnaEmas: string;
    ongkos: number;
    dp?: number;
    tanggalJanjiJadi?: string;
    tanggalSelesai?: string;
    tanggalAmbil?: string;
    catatan?: string;
    referensiGambarUrl?: string;
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
    beratAkhir?: number;
}
