import { describe, expect, it } from 'vitest';
import { fromDueDateIso, invoiceFormSchema, toDueDateIso } from './invoice-schema';

const valid = {
  clientId: 'c_1',
  assetCode: 'USDC',
  dueDate: '2026-12-01',
  notes: '',
  lineItems: [{ description: 'Work', quantity: '2', unitPrice: '10.50' }],
};

describe('invoiceFormSchema', () => {
  it('accepts a valid invoice', () => {
    expect(invoiceFormSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects bad amounts and empty line items', () => {
    const bad = invoiceFormSchema.safeParse({
      ...valid,
      lineItems: [{ description: '', quantity: '0', unitPrice: '1.123456789' }],
    });
    expect(bad.success).toBe(false);
    expect(invoiceFormSchema.safeParse({ ...valid, lineItems: [] }).success).toBe(false);
  });

  it('round-trips due dates in local time', () => {
    expect(fromDueDateIso(toDueDateIso('2026-12-01'))).toBe('2026-12-01');
  });
});
