import { useState } from 'react';
import { useInvoices, useMatchTransaction, type Transaction } from '@finance-os/api-client';
import {
  Address,
  Amount,
  Button,
  DescriptionList,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  StatusBadge,
} from '@finance-os/ui';
import { formatDate } from '@finance-os/utils';
import { FormError } from '../../components/forms/form-error';
import { QueryView } from '../../components/query-view';
import { env } from '../../env';

const MATCHABLE = new Set(['sent', 'partially_paid', 'overdue']);

/** Link an unmatched incoming payment to an open invoice. The API applies the match. */
export function MatchDrawer({
  transaction,
  onClose,
}: {
  transaction: Transaction;
  onClose: () => void;
}) {
  const invoices = useInvoices();
  const match = useMatchTransaction();
  const [invoiceId, setInvoiceId] = useState('');

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Match payment</SheetTitle>
          <SheetDescription>Choose the invoice this payment was for.</SheetDescription>
        </SheetHeader>
        <DescriptionList
          items={[
            {
              label: 'Amount',
              value: <Amount value={transaction.amount} assetCode={transaction.assetCode} />,
            },
            {
              label: 'From',
              value: <Address value={transaction.from} explorerBaseUrl={env.explorerUrl} />,
            },
            {
              label: 'Memo',
              value: transaction.memo ? (
                <code className="font-mono">{transaction.memo}</code>
              ) : (
                'None'
              ),
            },
            { label: 'Received', value: formatDate(transaction.createdAt) },
          ]}
        />
        <QueryView query={invoices} resource="open invoices">
          {(list) => {
            const open = list.filter(
              (i) => MATCHABLE.has(i.status) && i.assetCode === transaction.assetCode,
            );
            return open.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                There are no open {transaction.assetCode} invoices to match.
              </p>
            ) : (
              <fieldset className="grid gap-2">
                <legend className="mb-2 text-sm font-medium">Open invoices</legend>
                {open.map((inv) => (
                  <label
                    key={inv.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-primary has-[:checked]:bg-accent"
                  >
                    <input
                      type="radio"
                      name="invoice"
                      value={inv.id}
                      checked={invoiceId === inv.id}
                      onChange={() => setInvoiceId(inv.id)}
                      className="accent-[var(--primary)]"
                    />
                    <span className="grid flex-1 gap-0.5 text-sm">
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-medium">
                          {inv.number} · {inv.clientName}
                        </span>
                        <StatusBadge status={inv.status} />
                      </span>
                      <span className="text-muted-foreground">
                        <Amount value={inv.amount} assetCode={inv.assetCode} /> · paid{' '}
                        <Amount value={inv.amountPaid} assetCode={inv.assetCode} />
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>
            );
          }}
        </QueryView>
        <FormError error={match.error} />
        <SheetFooter>
          <Button
            disabled={!invoiceId || match.isPending}
            onClick={() => match.mutate({ id: transaction.id, invoiceId }, { onSuccess: onClose })}
          >
            {match.isPending ? 'Matching…' : 'Match to invoice'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
