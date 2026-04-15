export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';

  const parts = num.toFixed(2).split('.');
  const integerPart = parseInt(parts[0]).toLocaleString('es-VE');
  const decimalPart = parts[1] === '00' ? '' : `,${parts[1]}`;

  return decimalPart ? `${integerPart}${decimalPart}` : integerPart;
}

export function formatVES(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return formatNumber(num);
}

export function formatUSD(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return `$${formatNumber(num)}`;
}

export function formatPct(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return `${formatNumber(num)}%`;
}
