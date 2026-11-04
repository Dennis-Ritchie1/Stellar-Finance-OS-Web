import { describe, expect, it } from 'vitest';
import { can } from './permissions';

describe('can', () => {
  it('lets accountants write invoices but not manage settings', () => {
    expect(can('accountant', 'invoices:write')).toBe(true);
    expect(can('accountant', 'settings:manage')).toBe(false);
  });

  it('gives viewers read-only access', () => {
    expect(can('viewer', 'invoices:write')).toBe(false);
  });

  it('denies when role is unknown', () => {
    expect(can(undefined, 'exports:run')).toBe(false);
  });
});
