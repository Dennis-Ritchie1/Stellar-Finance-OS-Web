import { useSendInvoice, useVoidInvoice, type Invoice } from '@finance-os/api-client';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@finance-os/ui';
import { Ban, Link2, MoreHorizontal, Send } from 'lucide-react';
import { usePermission } from '../../auth/use-permission';
import { payLink } from './pay-link';

/** Quick actions on an invoice row: send, void, copy pay link. */
export function InvoiceActionsMenu({ invoice }: { invoice: Invoice }) {
  const canWrite = usePermission('invoices:write');
  const send = useSendInvoice();
  const voidInvoice = useVoidInvoice();
  const payable = !['draft', 'void'].includes(invoice.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Actions for ${invoice.number}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={!payable}
          onSelect={() => navigator.clipboard.writeText(payLink(invoice.publicToken))}
        >
          <Link2 /> Copy pay link
        </DropdownMenuItem>
        {canWrite ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={invoice.status !== 'draft' || send.isPending}
              onSelect={() => send.mutate(invoice.id)}
            >
              <Send /> Send invoice
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={['paid', 'void'].includes(invoice.status) || voidInvoice.isPending}
              onSelect={() => voidInvoice.mutate(invoice.id)}
              className="text-destructive focus:text-destructive"
            >
              <Ban /> Void invoice
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
