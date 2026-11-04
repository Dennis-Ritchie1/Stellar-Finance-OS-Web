import { describe, expect, it } from 'vitest';
import { isValidRange, lastDays } from './date-range';

describe('date range helpers', () => {
  it('builds inclusive presets', () => {
    expect(lastDays(30, new Date(2026, 10, 30))).toEqual({ from: '2026-11-01', to: '2026-11-30' });
  });

  it('validates ranges', () => {
    expect(isValidRange('2026-01-01', '2026-01-31')).toBe(true);
    expect(isValidRange('2026-02-01', '2026-01-31')).toBe(false);
    expect(isValidRange('', '2026-01-31')).toBe(false);
  });
});
