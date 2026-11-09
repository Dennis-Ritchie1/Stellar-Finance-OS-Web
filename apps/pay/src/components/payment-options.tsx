import type { PublicInvoice } from '@finance-os/api-client';
import { ConnectWalletPay } from './connect-wallet-pay';
import { PayFromAnyWallet } from './pay-from-any-wallet';
import { PaymentInProgress } from './payment-in-progress';
import type { PendingSubmission } from '../lib/pending-payment';

/** The payable part of the page: pay options, or "in progress" if a payment is already out. */
export function PaymentOptions({
  invoice,
  pending,
  onSubmitted,
  onPayAgain,
}: {
  invoice: PublicInvoice;
  pending: PendingSubmission | null;
  onSubmitted: (submission: { hash: string; amount: string }) => void;
  onPayAgain: () => void;
}) {
  if (pending) {
    return (
      <PaymentInProgress pending={pending} assetCode={invoice.assetCode} onPayAgain={onPayAgain} />
    );
  }
  return (
    <>
      <ConnectWalletPay invoice={invoice} onSubmitted={onSubmitted} />
      <PayFromAnyWallet invoice={invoice} />
    </>
  );
}
