import { Link } from 'react-router';
import { useInvoices } from '@finance-os/api-client';
import { Button, EmptyState, PageHeader, Spinner, StatusBadge } from '@finance-os/ui';
import { formatAmount, formatDate } from '@finance-os/utils';
import { AlertTriangle, FileText, Plus } from 'lucide-react';

export function InvoicesPage() {
  const { data, isPending, isError, refetch } = useInvoices();

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Bill clients and get paid in USDC."
        actions={
          <Button asChild>
            <Link to="/invoices/new">
              <Plus /> New invoice
            </Link>
          </Button>
        }
      />
      {isPending ? (
        <Spinner label="Loading invoices" />
      ) : isError ? (
        <EmptyState
          icon={<AlertTriangle />}
          title="Couldn't load invoices"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      ) : data.length === 0 ? (
        <EmptyState
          icon={<FileText />}
          title="No invoices yet"
          description="Create your first invoice to get paid."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((invoice) => (
                <tr key={invoice.id} className="border-t">
                  <td className="px-4 py-3">
                    <Link className="font-medium hover:underline" to={`/invoices/${invoice.id}`}>
                      {invoice.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{invoice.clientName}</td>
                  <td className="px-4 py-3">{formatDate(invoice.dueDate)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatAmount(invoice.amount, invoice.assetCode)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
