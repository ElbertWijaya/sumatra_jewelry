export type CreateInventoryDto = {
  orderId: number;
  code?: string;
  name?: string;
  category?: string;
  material?: string;
  goldType?: string;
  goldColor?: string;
  weightGross?: number;
  weightNet?: number;
  stoneCount?: number;
  stoneWeight?: number;
  size?: string; // legacy name; maps to ring_size in DB
  dimensions?: string;
  barcode?: string;
  sku?: string;
  location?: string;
  branchLocation?: 'ASIA' | 'SUN_PLAZA';
  placement?: 'ETALASE' | 'PENYIMPANAN';
  cost?: number;
  price?: number;
  status?: string;
  statusEnum?: 'DRAFT' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'RETURNED' | 'DAMAGED';
  images?: string[];
  notes?: string;
  stones?: { bentuk: string; jumlah: number; berat?: number }[];
};

export type UpdateInventoryDto = Partial<CreateInventoryDto>;
