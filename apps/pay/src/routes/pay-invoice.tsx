import { useParams } from 'react-router';
import { usePublicInvoice, type PublicInvoice } from '@finance-os/api-client';
import { Button, EmptyState, Spinner } from '@finance-os/ui';
import { AlertTriangle, Ban } from 'lucide-react';
import { InvoiceSummary } from '../components/invoice-summary';
import { PaidBanner } from '../components/paid-banner';
import { PaymentOptions } from '../components/payment-options';
import { usePendingPayment } from '../components/use-pending-payment';

/** Poll for the indexer to match the payment. */
const POLL_MS = 5_000;

export function PayInvoicePage() {
  const { publicToken = '' } = useParams();
  const {
    data: invoice,
    isPending,
    isError,
    refetch,
  } = usePublicInvoice(publicToken, { pollMs: POLL_MS });

  if (isPending) return <Spinner label="Loading invoice" />;

  if (isError) {
    return (
      <EmptyState
        icon={<AlertTriangle />}
        title="We couldn't load this invoice"
        description="The link may be wrong or expired. Check with the business that sent it."
        action={
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        }
      />
    );
  }

  return <InvoiceContent publicToken={publicToken} invoice={invoice} />;
}

/** Mounted for every loaded invoice so a stored submission is cleared once the invoice is paid. */
function InvoiceContent({ publicToken, invoice }: { publicToken: string; invoice: PublicInvoice }) {
  const { pending, record, dismiss } = usePendingPayment(publicToken, invoice);

  return (
    <div className="space-y-4">
      <InvoiceSummary invoice={invoice} />
      {invoice.status === 'paid' ? (
        <PaidBanner />
      ) : invoice.status === 'void' ? (
        <EmptyState
          icon={<Ban />}
          title="This invoice was cancelled"
          description="No payment is needed."
        />
      ) : invoice.status === 'draft' ? (
        <EmptyState
          title="This invoice isn't ready yet"
          description="The business hasn't sent it."
        />
      ) : (
        <PaymentOptions
          invoice={invoice}
          pending={pending}
          onSubmitted={record}
          onPayAgain={dismiss}
        />
      )}
    </div>
  );
}
