import type { InvoicePayment, StellarNetwork } from '@finance-os/wallet';
import { env } from '../env';

// stellar-sdk is heavy; load it only when the payer actually starts a wallet payment.
const load = () =>
  import('@finance-os/wallet/payment').then(({ createHorizon }) => createHorizon(env.horizonUrl));

/** Horizon client used to build and submit the payer's transaction. */
export const horizon = {
  async buildPaymentXdr(payment: InvoicePayment, network: StellarNetwork) {
    return (await load()).buildPaymentXdr(payment, network);
  },
  async submit(signedXdr: string, network: StellarNetwork) {
    return (await load()).submit(signedXdr, network);
  },
};
