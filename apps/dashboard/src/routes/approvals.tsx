import { useState } from 'react';
import { useMyApprovals, type PaymentRequest } from '@finance-os/api-client';
import { Address, Amount, Button, Card, CardContent, EmptyState, PageHeader } from '@finance-os/ui';
import { formatRelative } from '@finance-os/utils';
import { CheckSquare } from 'lucide-react';
import { QueryView } from '../components/query-view';
import { DecisionDialog, type Decision } from '../features/approvals/decision-dialog';
import { ApprovalTimeline } from '../features/payments/approval-timeline';

export function ApprovalsPage() {
  const query = useMyApprovals();
  const [active, setActive] = useState<{ request: PaymentRequest; decision: Decision } | null>(
    null,
  );

  return (
    <>
      <PageHeader title="Approvals" description="Payment requests waiting for your decision." />
      <QueryView
        query={query}
        resource="your approvals"
        isEmpty={(list) => list.length === 0}
        empty={
          <EmptyState
            icon={<CheckSquare />}
            title="You're all caught up"
            description="Nothing needs your approval right now."
          />
        }
      >
        {(requests) => (
          <ul className="grid gap-4" aria-label="Requests awaiting approval">
            {requests.map((request) => (
              <li key={request.id}>
                <Card>
                  <CardContent className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <div className="grid gap-3">
                      <div>
                        <p className="text-lg font-semibold">
                          <Amount value={request.amount} assetCode={request.assetCode} /> to{' '}
                          {request.vendorName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.description || 'No description'} · requested by{' '}
                          {request.createdByName} {formatRelative(request.createdAt)}
                        </p>
                        <p className="mt-1 text-sm">
                          To <Address value={request.destination} />
                          {request.memo ? (
                            <>
                              {' '}
                              · memo <code className="font-mono">{request.memo}</code>
                            </>
                          ) : null}
                        </p>
                      </div>
                      <ApprovalTimeline request={request} />
                    </div>
                    <div className="flex gap-2 md:flex-col">
                      <Button onClick={() => setActive({ request, decision: 'approve' })}>
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActive({ request, decision: 'reject' })}
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </QueryView>
      <DecisionDialog
        request={active?.request ?? null}
        decision={active?.decision ?? 'approve'}
        onClose={() => setActive(null)}
      />
    </>
  );
}
