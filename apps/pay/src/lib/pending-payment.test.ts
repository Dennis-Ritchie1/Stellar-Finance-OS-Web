import { describe, expect, it } from 'vitest';
import {
  clearPending,
  isPendingActive,
  loadPending,
  savePending,
  type PendingSubmission,
} from './pending-payment';

const HASH = 'a'.repeat(64);
const pending: PendingSubmission = {
  hash: HASH,
  amount: '4250.00',
  submittedAt: 1_000_000,
  amountPaidAtSubmit: '0.00',
};
const TTL = 15 * 60_000;

describe('pending payment storage', () => {
  it('round-trips through both stores and clears from both', () => {
    savePending('pub_1', pending);
    expect(window.sessionStorage.getItem('finance-os:pending-payment:pub_1')).toBeTruthy();
    expect(window.localStorage.getItem('finance-os:pending-payment:pub_1')).toBeTruthy();
    expect(loadPending('pub_1')).toEqual(pending);
    expect(loadPending('pub_2')).toBeNull();
    clearPending('pub_1');
    expect(loadPending('pub_1')).toBeNull();
  });

  it('stores only the public fields', () => {
    savePending('pub_1', { ...pending, xdr: 'SECRET_SIGNED_XDR' } as PendingSubmission);
    expect(window.localStorage.getItem('finance-os:pending-payment:pub_1')).not.toMatch(/XDR/);
  });

  it('ignores corrupt or malformed entries', () => {
    window.localStorage.setItem('finance-os:pending-payment:pub_1', '{nope');
    window.sessionStorage.setItem(
      'finance-os:pending-payment:pub_1',
      JSON.stringify({ hash: 'x', amount: 1 }),
    );
    expect(loadPending('pub_1')).toBeNull();
  });
});

describe('isPendingActive', () => {
  const open = { status: 'sent', amountPaid: '0.00' } as const;
  it('is active within the timeout while the invoice is unchanged', () => {
    expect(isPendingActive(pending, open, 1_000_000 + 60_000, TTL)).toBe(true);
  });
  it('expires after the timeout', () => {
    expect(isPendingActive(pending, open, 1_000_000 + TTL, TTL)).toBe(false);
  });
  it('expires once the invoice is paid', () => {
    expect(
      isPendingActive(pending, { status: 'paid', amountPaid: '4250.00' }, 1_000_001, TTL),
    ).toBe(false);
  });
  it('expires when a partial payment raises amountPaid', () => {
    expect(
      isPendingActive(pending, { status: 'partially_paid', amountPaid: '100.00' }, 1_000_001, TTL),
    ).toBe(false);
  });
  it('stays active when amountPaid is unchanged on a partially paid invoice', () => {
    const p = { ...pending, amountPaidAtSubmit: '2250.00' };
    expect(
      isPendingActive(p, { status: 'partially_paid', amountPaid: '2250' }, 1_000_001, TTL),
    ).toBe(true);
  });
});
