// Mapping enum status (uppercase underscore) ke label tampilan Indonesia yang rapi.
// Backend tetap kirim nilai enum seperti 'MENUNGGU','DALAM_PROSES','SIAP','DIAMBIL','BATAL'.
// Frontend gunakan fungsi displayStatus untuk merender tanpa underscore dan kapitalisasi judul.

const LABEL_MAP: Record<string,string> = {
  MENUNGGU: 'Menunggu',
  DALAM_PROSES: 'Dalam Proses',
  SIAP: 'Siap',
  DIAMBIL: 'Diambil',
  BATAL: 'Batal'
};

export function displayStatus(raw?: string | null) {
  const key = String(raw || '').toUpperCase();
  return LABEL_MAP[key] || key.replace(/_/g,' ').toLowerCase().replace(/(^|\s)([a-z])/g,(m,sp,ch)=> sp + ch.toUpperCase());
}

export function statusBadgeTone(raw?: string | null) {
  const key = String(raw || '').toUpperCase();
  if (key === 'MENUNGGU') return 'neutral';
  if (key === 'DALAM_PROSES') return 'info';
  if (key === 'SIAP' || key === 'DIAMBIL') return 'success';
  if (key === 'BATAL') return 'danger';
  return 'neutral';
}
