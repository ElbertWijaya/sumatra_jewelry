// Master option lists (dropdown categories)
export const JENIS_BARANG_OPTIONS = [
  'Bangle', 'Earring', 'Pendant', 'Necklace', 'Women Ring', 'Men Ring'
];
export const JENIS_EMAS_OPTIONS = [
  '24K','22K','18K','17K','16K','14K','12K','10K','9K'
];
export const WARNA_EMAS_OPTIONS = [
  'White Gold','Rose Gold','Yellow Gold'
];
export const BENTUK_BATU_OPTIONS = [
  'Round','Princess','Heart','Oval','Cushion','Marquise','Pear','Emerald','Straight Baguette','Tapered Baguette'
];

export interface StoneFormItem {
  bentuk: string;
  jumlah: string; // keep as string for input then convert
  berat: string;
}

export const emptyStone = (): StoneFormItem => ({ bentuk: '', jumlah: '1', berat: '' });
