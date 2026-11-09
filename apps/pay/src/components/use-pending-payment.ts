import { useCallback, useEffect, useState } from 'react';
import type { PublicInvoice } from '@finance-os/api-client';
import { env } from '../env';
import {
  clearPending,
  isPendingActive,
  loadPending,
  savePending,
  type PendingSubmission,
} from '../lib/pending-payment';

/**
 * Tracks a payment this browser already submitted for the invoice, so a reload, a closed tab
 * or a second visit doesn't invite paying twice while the backend indexer catches up.
 * Clears itself when the invoice is paid / has more paid, or after the timeout.
 */
export function usePendingPayment(publicToken: string, invoice: PublicInvoice) {
  const [pending, setPending] = useState<PendingSubmission | null>(() => loadPending(publicToken));
  const ttlMs = env.pendingPaymentMinutes * 60_000;
  const { status, amountPaid } = invoice;

  useEffect(() => {
    if (!pending) return;
    const check = () => {
      if (!isPendingActive(pending, { status, amountPaid }, Date.now(), ttlMs)) {
        clearPending(publicToken);
        setPending(null);
      }
    };
    check();
    const remaining = pending.submittedAt + ttlMs - Date.now();
    const id = setTimeout(check, Math.max(remaining, 0) + 10);
    return () => clearTimeout(id);
  }, [pending, status, amountPaid, ttlMs, publicToken]);

  const record = useCallback(
    (submission: { hash: string; amount: string }) => {
      const next: PendingSubmission = {
        ...submission,
        submittedAt: Date.now(),
        amountPaidAtSubmit: amountPaid,
      };
      savePending(publicToken, next);
      setPending(next);
    },
    [publicToken, amountPaid],
  );

  const dismiss = useCallback(() => {
    clearPending(publicToken);
    setPending(null);
  }, [publicToken]);

  return { pending, record, dismiss };
}
