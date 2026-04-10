export function formatCurrencyPhp(value: number): string {
  return `PHP ${Math.round(value).toLocaleString()}`;
}

export function formatCount(value: number): string {
  return Math.round(value).toLocaleString();
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function parseDisplayValue(valueDisplay: string): {
  numericValue: number;
  prefix: string;
  suffix: string;
} {
  // Strip out formatting so charts can work with plain numbers.
  const sanitized = valueDisplay.replace(/,/g, '');
  const numericMatch = sanitized.match(/-?\d+(\.\d+)?/);
  const numericValue = numericMatch ? Number.parseFloat(numericMatch[0]) : 0;

  let prefix = '';
  let suffix = '';

  // Keep currency and percent markers for display.
  if (/php|\u20b1/i.test(valueDisplay)) {
    prefix = '\u20b1';
  }

  if (/%/.test(valueDisplay)) {
    suffix = '%';
  }

  return { numericValue, prefix, suffix };
}

export function formatMonthKey(dateLike: string | Date): string {
  const date = typeof dateLike === 'string' ? new Date(dateLike) : dateLike;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
