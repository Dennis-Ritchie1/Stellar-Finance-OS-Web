import Big from 'big.js';

export interface FormatAmountOptions {
  /** Fixed number of decimal places to display. Defaults to 2. */
  decimals?: number;
  /** BCP-47 locale for grouping/decimal separators. Defaults to the user's locale. */
  locale?: string;
}

function separators(locale?: string): { group: string; decimal: string } {
  const parts = new Intl.NumberFormat(locale).formatToParts(1000000.5);
  return {
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
  };
}

/**
 * Format a decimal string amount without converting it to a float.
 * `formatDecimal("5000")` → `"5,000.00"`.
 */
export function formatDecimal(amount: string, options: FormatAmountOptions = {}): string {
  const { decimals = 2, locale } = options;
  const fixed = new Big(amount).toFixed(decimals, Big.roundHalfUp);
  const negative = fixed.startsWith('-');
  const [int = '0', frac] = (negative ? fixed.slice(1) : fixed).split('.');
  const { group, decimal } = separators(locale);
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return `${negative ? '-' : ''}${grouped}${frac ? decimal + frac : ''}`;
}

/** `formatAmount("5000", "USDC")` → `"5,000.00 USDC"`. Always shows the asset code. */
export function formatAmount(
  amount: string,
  assetCode: string,
  options?: FormatAmountOptions,
): string {
  return `${formatDecimal(amount, options)} ${assetCode}`;
}

/** Validate that a string is a non-negative decimal with at most 7 places (Stellar precision). */
export function isValidAmount(amount: string): boolean {
  return /^\d+(\.\d{1,7})?$/.test(amount.trim()) && new Big(amount.trim()).gt(0);
}

/** Exact decimal product for previews (e.g. a line total). Returns "" for invalid input. */
export function multiplyDecimals(a: string, b: string, decimals = 2): string {
  try {
    return new Big(a || '0').times(b || '0').toFixed(decimals, Big.roundHalfUp);
  } catch {
    return '';
  }
}

/** Exact decimal sum; invalid entries count as zero. */
export function sumDecimals(values: string[], decimals = 2): string {
  return values
    .reduce((acc, v) => {
      try {
        return acc.plus(v || '0');
      } catch {
        return acc;
      }
    }, new Big(0))
    .toFixed(decimals, Big.roundHalfUp);
}

/** Exact decimal comparison: -1 if a < b, 0 if equal, 1 if a > b. Invalid input counts as zero. */
export function compareDecimals(a: string, b: string): -1 | 0 | 1 {
  const toBig = (v: string) => {
    try {
      return new Big(v || '0');
    } catch {
      return new Big(0);
    }
  };
  return toBig(a).cmp(toBig(b)) as -1 | 0 | 1;
}

/** Convert a stroop count (1 XLM = 10,000,000 stroops) to an exact XLM decimal string. */
export function stroopsToXlm(stroops: string): string {
  return new Big(stroops).div(10_000_000).toFixed(7).replace(/0+$/, '').replace(/\.$/, '');
}
