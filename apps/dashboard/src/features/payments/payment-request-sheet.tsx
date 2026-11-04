import { usePaymentRequest } from '@finance-os/api-client';
import {
  Address,
  Amount,
  DescriptionList,
  PaymentStatusBadge,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@finance-os/ui';
import { formatDate } from '@finance-os/utils';
import { QueryView } from '../../components/query-view';
import { env } from '../../env';
import { ApprovalTimeline } from './approval-timeline';

/** Payment request details: summary, approvals and (when approved) sign & send. */
export function PaymentRequestSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const query = usePaymentRequest(id ?? '');

  return (
    <Sheet open={Boolean(id)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Payment request</SheetTitle>
          <SheetDescription>
            {query.data ? `To ${query.data.vendorName}` : 'Loading…'}
          </SheetDescription>
        </SheetHeader>
        {id ? (
          <QueryView query={query} resource="this payment request">
            {(request) => (
              <div className="grid gap-6">
                <DescriptionList
                  items={[
                    { label: 'Status', value: <PaymentStatusBadge status={request.status} /> },
                    {
                      label: 'Amount',
                      value: <Amount value={request.amount} assetCode={request.assetCode} />,
                    },
                    {
                      label: 'To',
                      value: (
                        <Address value={request.destination} explorerBaseUrl={env.explorerUrl} />
                      ),
                    },
                    ...(request.memo
                      ? [
                          {
                            label: 'Memo',
                            value: <code className="font-mono">{request.memo}</code>,
                          },
                        ]
                      : []),
                    {
                      label: 'From',
                      value: (
                        <Address
                          value={request.treasuryAddress}
                          explorerBaseUrl={env.explorerUrl}
                        />
                      ),
                    },
                    {
                      label: 'Requested by',
                      value: `${request.createdByName} · ${formatDate(request.createdAt)}`,
                    },
                    ...(request.description ? [{ label: 'For', value: request.description }] : []),
                  ]}
                />
                <ApprovalTimeline request={request} />
              </div>
            )}
          </QueryView>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
