import type { PublicInvoice } from '@finance-os/api-client';
import {
  Address,
  Alert,
  AlertDescription,
  AlertTitle,
  Amount,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DescriptionList,
} from '@finance-os/ui';
import { AlertCircle, Loader2, Wallet } from 'lucide-react';
import { stroopsToXlm } from '@finance-os/utils';
import { useWalletPayment } from './use-wallet-payment';

export function ConnectWalletPay({
  invoice,
  onSubmitted,
}: {
  invoice: PublicInvoice;
  onSubmitted: (submission: { hash: string; amount: string }) => void;
}) {
  const { state, start, confirm, reset } = useWalletPayment(invoice, onSubmitted);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay with a connected wallet</CardTitle>
        <CardDescription>Freighter, xBull, Lobstr and other Stellar wallets.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {state.step === 'checking' ? (
          <Alert>
            <Loader2 className="animate-spin" />
            <AlertTitle>Checking whether your payment went through…</AlertTitle>
            <AlertDescription>
              The network was slow to answer. Please keep this page open and don't pay again.
            </AlertDescription>
          </Alert>
        ) : state.step === 'review' || state.step === 'signing' ? (
          <>
            <p className="text-sm">Check the details, then approve the payment in your wallet.</p>
            <DescriptionList
              items={[
                {
                  label: 'Pay',
                  value: (
                    <Amount value={state.payment.amount} assetCode={state.payment.assetCode} />
                  ),
                },
                { label: 'To', value: invoice.businessName },
                { label: 'Invoice address', value: <Address value={state.payment.destination} /> },
                { label: 'From your wallet', value: <Address value={state.payer} /> },
                {
                  label: 'Network fee',
                  value: `Up to ${stroopsToXlm(state.feeStroops)} XLM`,
                },
              ]}
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={reset} disabled={state.step === 'signing'}>
                Cancel
              </Button>
              <Button onClick={confirm} disabled={state.step === 'signing'}>
                {state.step === 'signing' ? (
                  <>
                    <Loader2 className="animate-spin" /> Waiting for your wallet…
                  </>
                ) : (
                  'Confirm & sign'
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {state.step === 'error' ? (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            ) : null}
            <Button
              className="w-full"
              size="lg"
              onClick={start}
              disabled={state.step === 'connecting'}
            >
              {state.step === 'connecting' ? <Loader2 className="animate-spin" /> : <Wallet />}
              {state.step === 'connecting' ? 'Connecting…' : 'Connect wallet & pay'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
