export function formatCurrency(amount: number, currency: 'IDR' | 'USD' = 'IDR'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return 'Rp ' + new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export const formatRupiah = formatCurrency;

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

export function generateTrxId(existingCount: number): string {
  const nextNum = existingCount + 1;
  return `#TRX-${String(nextNum).padStart(3, '0')}`;
}

export function getIndonesianDate(): string {
  const now = new Date();
  return now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getIndonesianFullDate(): string {
  const now = new Date();
  return now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getIndonesianTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
