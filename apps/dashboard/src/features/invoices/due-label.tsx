import type { InvoiceStatus } from '@finance-os/api-client';
import { daysOverdue, formatDate } from '@finance-os/utils';

/** "Due 4 Dec 2026", or "3 days overdue" when the API says the invoice is overdue. */
export function DueLabel({ dueDate, status }: { dueDate: string; status: InvoiceStatus }) {
  if (status === 'overdue') {
    const days = daysOverdue(dueDate);
    return (
      <span className="font-medium text-status-danger">
        {days === 0 ? 'Due today' : `${days} ${days === 1 ? 'day' : 'days'} overdue`}
      </span>
    );
  }
  return <span>{formatDate(dueDate)}</span>;
}
