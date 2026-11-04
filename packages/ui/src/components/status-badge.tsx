import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../lib/utils';

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'void';

const LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  partially_paid: 'Partially paid',
  paid: 'Paid',
  overdue: 'Overdue',
  void: 'Void',
};

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      status: {
        draft: 'border-border bg-muted text-muted-foreground',
        sent: 'border-transparent bg-status-info/15 text-status-info',
        partially_paid: 'border-transparent bg-status-warning/15 text-status-warning',
        paid: 'border-transparent bg-status-success/15 text-status-success',
        overdue: 'border-transparent bg-status-danger/15 text-status-danger',
        void: 'border-border bg-transparent text-muted-foreground line-through',
      },
    },
  },
);

export interface StatusBadgeProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  status: InvoiceStatus;
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  return (
    <span data-slot="status-badge" className={cn(statusBadgeVariants({ status }), className)} {...props}>
      {LABELS[status]}
    </span>
  );
}
