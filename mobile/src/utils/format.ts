export function formatCurrency(
  value: number,
  {
    locale = 'id-ID',
    currency = 'IDR',
    minimumFractionDigits = 0,
  }: {
    locale?: string;
    currency?: string;
    minimumFractionDigits?: number;
  } = {}
) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, locale = 'id-ID') {
  return new Intl.NumberFormat(locale).format(value);
}
