import type { PublicInvoice } from '@finance-os/api-client';
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from '@finance-os/ui';
import { formatAmount, formatDate } from '@finance-os/utils';

export function InvoiceSummary({ invoice }: { invoice: PublicInvoice }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{invoice.businessName}</p>
            <CardTitle className="text-lg">Invoice {invoice.number}</CardTitle>
          </div>
          <StatusBadge status={invoice.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="divide-y text-sm">
          {invoice.lineItems.map((item, i) => (
            <li key={i} className="flex justify-between gap-4 py-2">
              <span>
                {item.description}
                <span className="text-muted-foreground"> × {item.quantity}</span>
              </span>
              <span className="tabular-nums">{formatAmount(item.total, invoice.assetCode)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-end justify-between border-t pt-4">
          <span className="text-sm text-muted-foreground">Due {formatDate(invoice.dueDate)}</span>
          <span className="text-2xl font-semibold tabular-nums">{formatAmount(invoice.amount, invoice.assetCode)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
