import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { usePaymentRequests, type PaymentRequest } from '@finance-os/api-client';
import {
  Amount,
  Button,
  createDataTableColumns,
  DataTable,
  EmptyState,
  PageHeader,
  PaymentStatusBadge,
} from '@finance-os/ui';
import { formatRelative } from '@finance-os/utils';
import { Plus, Send } from 'lucide-react';
import { Can } from '../components/can';
import { QueryView } from '../components/query-view';
import { PaymentRequestFormDialog } from '../features/payments/payment-request-form-dialog';
import { PaymentRequestSheet } from '../features/payments/payment-request-sheet';

const col = createDataTableColumns<PaymentRequest>();

export function OutgoingPaymentsPage() {
  const query = usePaymentRequests();
  const [creating, setCreating] = useState(false);
  const [params, setParams] = useSearchParams();
  const selected = params.get('request');
  const open = (id: string) => setParams({ request: id });

  const columns = [
    col.accessor('vendorName', {
      header: 'Vendor',
      sortFn: 'text',
      cell: ({ row }) => (
        <button
          type="button"
          className="font-medium hover:underline"
          onClick={() => open(row.original.id)}
        >
          {row.original.vendorName}
        </button>
      ),
    }),
    col.accessor('description', {
      header: 'For',
      enableSorting: false,
      cell: ({ getValue }) => getValue() || '—',
    }),
    col.accessor('status', {
      header: 'Status',
      cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
    }),
    col.accessor('createdAt', {
      header: 'Requested',
      sortFn: 'datetime',
      cell: ({ getValue }) => formatRelative(getValue()),
    }),
    col.accessor('amount', {
      header: 'Amount',
      enableSorting: false,
      meta: { className: 'text-right' },
      cell: ({ row }) => <Amount value={row.original.amount} assetCode={row.original.assetCode} />,
    }),
  ];

  return (
    <>
      <PageHeader
        title="Payments"
        description="Request a payment, get it approved, then sign and send."
        actions={
          <Can permission="payments:request">
            <Button onClick={() => setCreating(true)}>
              <Plus /> New payment request
            </Button>
          </Can>
        }
      />
      <QueryView
        query={query}
        resource="payment requests"
        isEmpty={(list) => list.length === 0}
        empty={
          <EmptyState
            icon={<Send />}
            title="No payment requests yet"
            description="Create one to pay a vendor."
          />
        }
      >
        {(requests) => (
          <DataTable
            aria-label="Payment requests"
            columns={columns}
            data={requests}
            getRowId={(r) => r.id}
          />
        )}
      </QueryView>
      <PaymentRequestFormDialog open={creating} onOpenChange={setCreating} />
      <PaymentRequestSheet id={selected} onClose={() => setParams({})} />
    </>
  );
}
