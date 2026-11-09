import { compareDecimals } from '@finance-os/utils';
import type { PublicInvoice } from '@finance-os/api-client';

/**
 * A payment this browser submitted that the backend hasn't matched yet. Only public data:
 * the transaction hash and amounts — never keys or signed XDR.
 */
export interface PendingSubmission {
  hash: string;
  amount: string;
  /** Epoch ms. */
  submittedAt: number;
  /** Invoice `amountPaid` when we submitted; paid > this means the indexer saw a payment. */
  amountPaidAtSubmit: string;
}

const keyFor = (publicToken: string) => `finance-os:pending-payment:${publicToken}`;

function isPendingSubmission(value: unknown): value is PendingSubmission {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.hash === 'string' &&
    /^[0-9a-f]{64}$/i.test(v.hash) &&
    typeof v.amount === 'string' &&
    typeof v.submittedAt === 'number' &&
    typeof v.amountPaidAtSubmit === 'string'
  );
}

/** Storage can throw (private mode, blocked site data); treat that as "nothing stored". */
function stores(): Storage[] {
  const list: Storage[] = [];
  try {
    list.push(window.sessionStorage);
  } catch {
    /* unavailable */
  }
  try {
    list.push(window.localStorage);
  } catch {
    /* unavailable */
  }
  return list;
}

/** Read the newest valid submission from sessionStorage / localStorage. */
export function loadPending(publicToken: string): PendingSubmission | null {
  let best: PendingSubmission | null = null;
  for (const store of stores()) {
    try {
      const raw = store.getItem(keyFor(publicToken));
      if (!raw) continue;
      const parsed: unknown = JSON.parse(raw);
      if (isPendingSubmission(parsed) && (!best || parsed.submittedAt > best.submittedAt)) {
        best = parsed;
      }
    } catch {
      /* corrupt entry — ignore */
    }
  }
  return best;
}

export function savePending(publicToken: string, submission: PendingSubmission): void {
  const value = JSON.stringify({
    hash: submission.hash,
    amount: submission.amount,
    submittedAt: submission.submittedAt,
    amountPaidAtSubmit: submission.amountPaidAtSubmit,
  } satisfies PendingSubmission);
  for (const store of stores()) {
    try {
      store.setItem(keyFor(publicToken), value);
    } catch {
      /* quota / blocked — best effort */
    }
  }
}

export function clearPending(publicToken: string): void {
  for (const store of stores()) {
    try {
      store.removeItem(keyFor(publicToken));
    } catch {
      /* best effort */
    }
  }
}

/** Whether the stored submission should still block a second payment. */
export function isPendingActive(
  pending: PendingSubmission,
  invoice: Pick<PublicInvoice, 'status' | 'amountPaid'>,
  now: number,
  ttlMs: number,
): boolean {
  if (invoice.status === 'paid') return false;
  if (compareDecimals(invoice.amountPaid, pending.amountPaidAtSubmit) > 0) return false;
  return now - pending.submittedAt < ttlMs;
}
