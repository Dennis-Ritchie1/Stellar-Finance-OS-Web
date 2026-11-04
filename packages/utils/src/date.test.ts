import { describe, expect, it } from 'vitest';
import { daysOverdue, formatRelative } from './date';

describe('date', () => {
  const now = new Date('2026-11-04T12:00:00Z');

  it('counts days overdue', () => {
    expect(daysOverdue('2026-11-01T12:00:00Z', now)).toBe(3);
    expect(daysOverdue('2026-11-10T12:00:00Z', now)).toBe(0);
  });

  it('formats relative time', () => {
    expect(formatRelative('2026-11-01T12:00:00Z', now, 'en')).toBe('3 days ago');
  });
});
