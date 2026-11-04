import type { PaymentRequest } from '@finance-os/api-client';
import {
  Address,
  Alert,
  AlertDescription,
  AlertTitle,
  Amount,
  Button,
  DescriptionList,
} from '@finance-os/ui';
import { explorerUrl } from '@finance-os/utils';
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, PenLine } from 'lucide-react';
import { env } from '../../env';
import { useSignAndSend } from './use-sign-and-send';

/** Shown on approved requests the user may send, and on in-flight / settled ones. */
export function SignAndSendPanel({ request }: { request: PaymentRequest }) {
  const { state, prepare, signAndSubmit, reset } = useSignAndSend(request);

  if (request.status === 'submitted') {
    return (
      <Alert variant="info">
        <Loader2 className="animate-spin" />
        <AlertTitle>Payment sent — confirming</AlertTitle>
        <AlertDescription>
          This updates automatically once the network confirms it.
        </AlertDescription>
      </Alert>
    );
  }

  if (request.status === 'settled') {
    return (
      <Alert variant="success">
        <CheckCircle2 />
        <AlertTitle>Paid</AlertTitle>
        <AlertDescription>
          {request.txHash ? (
            <a
              className="inline-flex items-center gap-1 text-primary hover:underline"
              href={explorerUrl(env.explorerUrl, 'tx', request.txHash)}
              target="_blank"
              rel="noreferrer"
            >
              View on explorer <ExternalLink className="size-3.5" />
            </a>
          ) : (
            'The payment has settled.'
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (request.status === 'failed') {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>
          {request.failureReason ?? 'The network rejected this payment.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (request.status !== 'approved') return null;
  if (!request.canSubmit) {
    return (
      <p className="text-sm text-muted-foreground">
        Approved. Someone with signing rights can now send it.
      </p>
    );
  }

  const built = 'built' in state ? state.built : undefined;

  return (
    <div className="grid gap-4 rounded-lg border p-4">
      <p className="font-medium">Sign &amp; send</p>
      {built ? (
        <>
          <p className="text-sm text-muted-foreground">
            Your wallet will ask you to sign exactly this payment:
          </p>
          <DescriptionList
            items={[
              {
                label: 'Send',
                value: <Amount value={built.summary.amount} assetCode={built.summary.assetCode} />,
              },
              { label: 'To', value: <Address value={built.summary.to} /> },
              ...(built.summary.memo
                ? [
                    {
                      label: 'Memo',
                      value: <code className="font-mono">{built.summary.memo}</code>,
                    },
                  ]
                : []),
              { label: 'From', value: <Address value={built.summary.from} /> },
              {
                label: 'Network fee',
                value: <Amount value={built.summary.fee} assetCode="XLM" decimals={7} />,
              },
            ]}
          />
        </>
      ) : null}
      {state.step === 'error' ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2">
        {built ? (
          <>
            <Button variant="outline" onClick={reset} disabled={state.step === 'signing'}>
              Cancel
            </Button>
            <Button onClick={signAndSubmit} disabled={state.step === 'signing'}>
              {state.step === 'signing' ? <Loader2 className="animate-spin" /> : <PenLine />}
              {state.step === 'signing' ? 'Waiting for your wallet…' : 'Open wallet to sign'}
            </Button>
          </>
        ) : (
          <Button
            onClick={prepare}
            disabled={state.step === 'building' || state.step === 'submitting'}
          >
            {state.step === 'building' || state.step === 'submitting' ? (
              <Loader2 className="animate-spin" />
            ) : (
              <PenLine />
            )}
            {state.step === 'submitting' ? 'Sending…' : 'Sign & send'}
          </Button>
        )}
      </div>
    </div>
  );
}
