import { describe, expect, it } from 'vitest';
import { formatAmount, formatDecimal, isValidAmount } from './money';

describe('money', () => {
  it('formats with grouping and asset code', () => {
    expect(formatAmount('5000', 'USDC', { locale: 'en-US' })).toBe('5,000.00 USDC');
  });

  it('keeps precision a float would lose', () => {
    expect(formatDecimal('12345678901234.1234567', { decimals: 7, locale: 'en-US' })).toBe(
      '12,345,678,901,234.1234567',
    );
  });

  it('handles negatives and rounding', () => {
    expect(formatDecimal('-0.005', { locale: 'en-US' })).toBe('-0.01');
  });

  it('validates Stellar amounts', () => {
    expect(isValidAmount('10.5')).toBe(true);
    expect(isValidAmount('0')).toBe(false);
    expect(isValidAmount('1.12345678')).toBe(false);
    expect(isValidAmount('abc')).toBe(false);
  });
});
