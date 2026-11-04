import { useState } from 'react';
import type { PublicInvoice } from '@finance-os/api-client';
import { describeWalletError, useWallet, type InvoicePayment } from '@finance-os/wallet';
import { env } from '../env';
import { horizon } from '../lib/horizon';

export type PaymentStep =
  | { step: 'idle' }
  | { step: 'connecting' }
  | { step: 'review'; payer: string; xdr: string; payment: InvoicePayment }
  | { step: 'signing'; payer: string; payment: InvoicePayment }
  | { step: 'submitted'; hash: string }
  | { step: 'error'; message: string };

/**
 * Connect → build (client-side, to the invoice's muxed address) → review → sign → submit.
 * The page keeps polling the API; it flips to "Paid" once the indexer matches the payment.
 */
export function useWalletPayment(invoice: PublicInvoice) {
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
      const xdr = await horizon.buildPaymentXdr(payment, env.network);
      setState({ step: 'review', payer, xdr, payment });
    } catch (e) {
      fail(e);
    }
  }

  async function confirm() {
    if (state.step !== 'review') return;
    const { payer, payment, xdr } = state;
    setState({ step: 'signing', payer, payment });
    try {
      const signed = await wallet.signTransaction(xdr);
      const hash = await horizon.submit(signed, env.network);
      setState({ step: 'submitted', hash });
    } catch (e) {
      fail(e);
    }
  }

  const reset = () => setState({ step: 'idle' });

  return { state, start, confirm, reset };
}
