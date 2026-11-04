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
import { AlertCircle, CheckCircle2, Loader2, Wallet } from 'lucide-react';
import { env } from '../env';
import { useWalletPayment } from './use-wallet-payment';

export function ConnectWalletPay({ invoice }: { invoice: PublicInvoice }) {
  const { state, start, confirm, reset } = useWalletPayment(invoice);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay with a connected wallet</CardTitle>
        <CardDescription>Freighter, xBull, Lobstr and other Stellar wallets.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {state.step === 'review' || state.step === 'signing' ? (
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
                { label: 'Network fee', value: 'Under 0.001 XLM' },
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
        ) : state.step === 'submitted' ? (
          <Alert variant="success">
            <CheckCircle2 />
            <AlertTitle>Payment sent</AlertTitle>
            <AlertDescription>
              We're confirming it now — this page updates automatically.{' '}
              <a
                className="text-primary underline"
                href={`${env.explorerUrl.replace(/\/+$/, '')}/tx/${state.hash}`}
                target="_blank"
                rel="noreferrer"
              >
                View on explorer
              </a>
            </AlertDescription>
          </Alert>
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
