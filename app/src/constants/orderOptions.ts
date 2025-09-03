export const JENIS_BARANG_OPTIONS = [
  'Cincin','Gelang','Kalung','Liontin','Anting','Giwang','Set Perhiasan'
];
export const JENIS_EMAS_OPTIONS = [
  'Emas Kuning','Emas Putih','Rose Gold','Emas Muda','Emas Tua'
];
export const WARNA_EMAS_OPTIONS = [
  'Kuning','Putih','Rose','Doff','Kombinasi'
];

export interface StoneFormItem {
  bentuk: string;
  jumlah: string; // keep as string for input then convert
  berat: string;
}

export const emptyStone = (): StoneFormItem => ({ bentuk: '', jumlah: '1', berat: '' });
