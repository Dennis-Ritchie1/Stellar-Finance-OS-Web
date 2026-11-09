import { useState } from 'react';
import type { PublicInvoice } from '@finance-os/api-client';
import { describeWalletError, useWallet, type InvoicePayment } from '@finance-os/wallet';
import { env } from '../env';
import { horizon } from '../lib/horizon';

function isUnconfirmed(e: unknown): e is { reason: string; hash: string } {
  return (
    typeof e === 'object' &&
    e !== null &&
    (e as { reason?: unknown }).reason === 'timeout_unknown' &&
    typeof (e as { hash?: unknown }).hash === 'string'
  );
}

export type PaymentStep =
  | { step: 'idle' }
  | { step: 'connecting' }
  | {
      step: 'review';
      payer: string;
      xdr: string;
      payment: InvoicePayment;
      feeStroops: string;
    }
  | { step: 'signing'; payer: string; payment: InvoicePayment; feeStroops: string }
  | { step: 'checking'; payer: string; payment: InvoicePayment }
  | { step: 'error'; message: string };

/**
 * Connect → build (client-side, to the invoice's muxed address) → review → sign → submit.
 * The page keeps polling the API; it flips to "Paid" once the indexer matches the payment.
 */
export function useWalletPayment(
  invoice: PublicInvoice,
  /** Called once the network accepted the payment (or may have — hash is public, nothing secret). */
  onSubmitted: (submission: { hash: string; amount: string }) => void,
) {
  const wallet = useWallet();
  const [state, setState] = useState<PaymentStep>({ step: 'idle' });

  const fail = (e: unknown) => setState({ step: 'error', message: describeWalletError(e) });

  async function start() {
    setState({ step: 'connecting' });
    try {
      const payer = wallet.address ?? (await wallet.connect());
      const payment: InvoicePayment = {
        source: payer,
        destination: invoice.payment.muxedAddress,
        amount: invoice.amountDue,
        assetCode: invoice.assetCode,
        assetIssuer: invoice.assetCode === 'XLM' ? undefined : invoice.payment.assetIssuer,
      };
      const { xdr, feeStroops } = await horizon.buildPaymentXdr(payment, env.network);
      setState({ step: 'review', payer, xdr, payment, feeStroops });
    } catch (e) {
      fail(e);
    }
  }

  async function confirm() {
    if (state.step !== 'review') return;
    const { payer, payment, xdr, feeStroops } = state;
    setState({ step: 'signing', payer, payment, feeStroops });
    try {
      const signed = await wallet.signTransaction(xdr);
      const hash = await horizon.submit(signed, env.network, () =>
        setState({ step: 'checking', payer, payment }),
      );
      onSubmitted({ hash, amount: payment.amount });
      setState({ step: 'idle' });
    } catch (e) {
      // The payment may still have landed: remember its (public) hash so we never invite a repeat.
      if (isUnconfirmed(e)) onSubmitted({ hash: e.hash, amount: payment.amount });
      fail(e);
    }
  }

  const reset = () => setState({ step: 'idle' });

  return { state, start, confirm, reset };
}
