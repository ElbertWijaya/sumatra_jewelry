export function formatIDR(value: number | null | undefined): string {
  if (value == null || isNaN(Number(value))) return '-';
  const f = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
  return f.replace(/\u00A0/g, ' ');
}

export function formatIDRInputText(text: string): string {
  const digits = (text || '').replace(/\D+/g, '');
  if (!digits) return '';
  const n = Number(digits);
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(n).replace(/\u00A0/g, ' ');
}

export function parseIDR(text: string | null | undefined): number | undefined {
  if (!text) return undefined;
  const digits = String(text).replace(/\D+/g, '');
  if (!digits) return undefined;
  const n = Number(digits);
  return isNaN(n) ? undefined : n;
}
