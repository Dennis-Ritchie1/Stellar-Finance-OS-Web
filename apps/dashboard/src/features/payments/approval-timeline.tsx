import type { PaymentRequest } from '@finance-os/api-client';
import { formatRelative } from '@finance-os/utils';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';

/** Who approved/rejected, and how many approvals are still needed (as reported by the API). */
export function ApprovalTimeline({ request }: { request: PaymentRequest }) {
  const approvedCount = request.approvals.filter((a) => a.decision === 'approved').length;
  const remaining = Math.max(0, request.requiredApprovals - approvedCount);

  return (
    <div className="grid gap-3">
      <p className="text-sm font-medium">
        Approvals · {approvedCount} of {request.requiredApprovals}
      </p>
      <ol className="grid gap-3 text-sm">
        {request.approvals.map((a) => (
          <li key={a.userId + a.decidedAt} className="flex gap-3">
            {a.decision === 'approved' ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-status-success" />
            ) : (
              <XCircle className="mt-0.5 size-4 shrink-0 text-status-danger" />
            )}
            <div>
              <p>
                <span className="font-medium">{a.userName}</span>{' '}
                {a.decision === 'approved' ? 'approved' : 'rejected'} ·{' '}
                {formatRelative(a.decidedAt)}
              </p>
              {a.comment ? <p className="text-muted-foreground">“{a.comment}”</p> : null}
            </div>
          </li>
        ))}
        {request.status === 'pending_approval'
          ? Array.from({ length: remaining }, (_, i) => (
              <li key={`pending-${i}`} className="flex gap-3 text-muted-foreground">
                <Circle className="mt-0.5 size-4 shrink-0" /> Waiting for approval
              </li>
            ))
          : null}
      </ol>
    </div>
  );
}
