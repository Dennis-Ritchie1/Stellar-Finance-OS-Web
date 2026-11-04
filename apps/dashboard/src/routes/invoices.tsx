import { Link, useSearchParams } from 'react-router';
import { useInvoices, type InvoiceStatus } from '@finance-os/api-client';
import { Button, DataTable, EmptyState, PageHeader } from '@finance-os/ui';
import { FileText, Plus } from 'lucide-react';
import { Can } from '../components/can';
import { QueryView } from '../components/query-view';
import { invoiceColumns } from '../features/invoices/invoice-columns';
import { StatusFilter } from '../features/invoices/status-filter';

export function InvoicesPage() {
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') as InvoiceStatus | null) ?? undefined;
  const query = useInvoices(status);

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Bill clients and get paid in USDC."
        actions={
          <Can permission="invoices:write">
            <Button asChild>
              <Link to="/invoices/new">
                <Plus /> New invoice
              </Link>
            </Button>
          </Can>
        }
      />
      <StatusFilter
        value={status}
        onChange={(next) => setParams(next ? { status: next } : {}, { replace: true })}
      />
      <QueryView
        query={query}
        resource="invoices"
        isEmpty={(invoices) => invoices.length === 0}
        empty={
          <EmptyState
            icon={<FileText />}
            title={status ? 'No invoices with this status' : 'No invoices yet'}
            description={status ? 'Try another filter.' : 'Create your first invoice to get paid.'}
          />
        }
      >
        {(invoices) => (
          <DataTable
            aria-label="Invoices"
            columns={invoiceColumns}
            data={invoices}
            getRowId={(invoice) => invoice.id}
          />
        )}
      </QueryView>
    </>
  );
}
