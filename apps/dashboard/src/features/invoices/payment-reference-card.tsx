import type { PaymentReference } from '@finance-os/api-client';
import {
  Address,
  Alert,
  AlertDescription,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CopyButton,
  DescriptionList,
} from '@finance-os/ui';
import { AlertTriangle } from 'lucide-react';
import { env } from '../../env';

/** How a client pays this invoice: a unique muxed address, or the treasury address + memo. */
export function PaymentReferenceCard({ payment }: { payment: PaymentReference }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment reference</CardTitle>
        <CardDescription>
          Payments to the invoice address are matched automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <DescriptionList
          items={[
            { label: 'Invoice address', value: <Address value={payment.muxedAddress} /> },
            {
              label: 'Or treasury address',
              value: <Address value={payment.address} explorerBaseUrl={env.explorerUrl} />,
            },
            {
              label: 'Memo',
              value: (
                <span className="inline-flex items-center gap-1">
                  <code className="font-mono">{payment.memo}</code>
                  <CopyButton value={payment.memo} label="Copy memo" variant="ghost" />
                </span>
              ),
            },
          ]}
        />
        <Alert variant="warning">
          <AlertTriangle />
          <AlertDescription>
            If you pay to the G-address, you must include this memo or your payment can't be
            matched.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
