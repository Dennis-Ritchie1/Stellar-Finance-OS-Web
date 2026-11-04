import * as React from 'react';
import { cn } from '../lib/utils';

export type PaymentRequestStatus =
  'pending_approval' | 'approved' | 'rejected' | 'submitted' | 'settled' | 'failed';

const STYLES: Record<PaymentRequestStatus, { label: string; className: string }> = {
  pending_approval: {
    label: 'Awaiting approval',
    className: 'bg-status-warning/15 text-status-warning',
  },
  approved: { label: 'Approved', className: 'bg-status-info/15 text-status-info' },
  rejected: { label: 'Rejected', className: 'bg-muted text-muted-foreground' },
  submitted: { label: 'Sending', className: 'bg-status-info/15 text-status-info' },
  settled: { label: 'Paid', className: 'bg-status-success/15 text-status-success' },
  failed: { label: 'Failed', className: 'bg-status-danger/15 text-status-danger' },
};

export function PaymentStatusBadge({
  status,
  className,
  ...props
}: Omit<React.ComponentProps<'span'>, 'children'> & { status: PaymentRequestStatus }) {
  const style = STYLES[status];
  return (
    <span
      data-slot="payment-status-badge"
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        style.className,
        className,
      )}
      {...props}
    >
      {style.label}
    </span>
  );
}
