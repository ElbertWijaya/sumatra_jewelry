export declare const ORDER_STATUS_VALUES: readonly ["DRAFT", "DITERIMA", "DALAM_PROSES", "SIAP", "DIAMBIL", "BATAL"];
export type OrderStatusEnum = typeof ORDER_STATUS_VALUES[number];
export interface RequestUser {
    userId: string;
    role: string;
    email: string;
}
export declare class CreateOrderDto {
    customerName: string;
    customerPhone?: string;
    jenis: string;
    kadar?: number;
    beratTarget?: number;
    ongkos: number;
    dp?: number;
    tanggalJanjiJadi?: string;
    catatan?: string;
}
export declare class UpdateOrderStatusDto {
    status: OrderStatusEnum;
    beratAkhir?: number;
}
