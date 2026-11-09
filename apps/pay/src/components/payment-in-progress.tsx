import { useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Amount,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@finance-os/ui';
import { Loader2 } from 'lucide-react';
import { env } from '../env';
import type { PendingSubmission } from '../lib/pending-payment';

/** Shown instead of the pay buttons while a submitted payment awaits confirmation. */
export function PaymentInProgress({
  pending,
  assetCode,
  onPayAgain,
}: {
  pending: PendingSubmission;
  assetCode: string;
  onPayAgain: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <Card>
      <CardContent className="grid gap-4">
        <Alert variant="success">
          <Loader2 className="animate-spin" />
          <AlertTitle>Payment in progress</AlertTitle>
          <AlertDescription>
            <p>
              You sent <Amount value={pending.amount} assetCode={assetCode} />. We're confirming it
              now. This page updates automatically, so you don't need to pay again.
            </p>
            <a
              className="text-primary underline"
              href={`${env.explorerUrl.replace(/\/+$/, '')}/tx/${pending.hash}`}
              target="_blank"
              rel="noreferrer"
            >
              View on explorer
            </a>
          </AlertDescription>
        </Alert>
        <Button
          variant="link"
          className="justify-self-start px-0"
          onClick={() => setConfirming(true)}
        >
          I need to pay again
        </Button>
      </CardContent>
      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay again?</DialogTitle>
            <DialogDescription>
              You already sent <Amount value={pending.amount} assetCode={assetCode} />, and it may
              still be confirming. Paying again sends a second payment that can't be taken back.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Keep waiting
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirming(false);
                onPayAgain();
              }}
            >
              Pay again anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
