import { QRCodeSVG } from 'qrcode.react';
import type { PublicInvoice } from '@finance-os/api-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CopyButton,
} from '@finance-os/ui';
import { AlertTriangle } from 'lucide-react';
import { buildSep7PayUri, toSep7MemoType } from '../lib/sep7';

function Field({ label, value, copyLabel }: { label: string; value: string; copyLabel: string }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-2">
        <code className="min-w-0 flex-1 break-all rounded-md bg-muted px-2 py-1.5 font-mono text-sm">
          {value}
        </code>
        <CopyButton value={value} label={copyLabel} />
      </dd>
    </div>
  );
}

export function PayFromAnyWallet({ invoice }: { invoice: PublicInvoice }) {
  const { address, memo, memoType, assetIssuer } = invoice.payment;
  const uri = buildSep7PayUri({
    destination: address,
    amount: invoice.amountDue,
    assetCode: invoice.assetCode,
    assetIssuer,
    memo,
    memoType: toSep7MemoType(memoType),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay from any wallet</CardTitle>
        <CardDescription>
          Scan the code with your Stellar wallet, or copy the details below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="mx-auto w-fit rounded-lg bg-white p-3">
          <QRCodeSVG value={uri} size={192} aria-label="Payment QR code" />
        </div>
        <dl className="space-y-3">
          <Field label="Address" value={address} copyLabel="Copy address" />
          <Field label="Memo" value={memo} copyLabel="Copy memo" />
          <Field
            label={`Amount due (${invoice.assetCode})`}
            value={invoice.amount}
            copyLabel="Copy amount"
          />
        </dl>
        <p
          role="note"
          className="flex gap-2 rounded-md border border-status-warning/40 bg-status-warning/10 p-3 text-sm"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-status-warning" />
          If you pay to the G-address, you must include this memo or your payment can't be matched.
        </p>
      </CardContent>
    </Card>
  );
}
