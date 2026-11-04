import { Link, useParams } from 'react-router';
import { useInvoice, useSendInvoice, useVoidInvoice } from '@finance-os/api-client';
import {
  Amount,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CopyButton,
  DescriptionList,
  PageHeader,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@finance-os/ui';
import { formatDate } from '@finance-os/utils';
import { ExternalLink, Pencil, Send } from 'lucide-react';
import { Can } from '../components/can';
import { FormError } from '../components/forms/form-error';
import { QueryView } from '../components/query-view';
import { DueLabel } from '../features/invoices/due-label';
import { MatchHistory } from '../features/invoices/match-history';
import { payLink } from '../features/invoices/pay-link';
import { PaymentReferenceCard } from '../features/invoices/payment-reference-card';

export function InvoiceDetailPage() {
  const { id = '' } = useParams();
  const query = useInvoice(id);
  const send = useSendInvoice();
  const voidInvoice = useVoidInvoice();

  return (
    <QueryView query={query} resource="this invoice">
      {(invoice) => {
        const link = payLink(invoice.publicToken);
        const payable = !['draft', 'void'].includes(invoice.status);
        return (
          <>
            <PageHeader
              title={
                <span className="flex flex-wrap items-center gap-3">
                  Invoice {invoice.number} <StatusBadge status={invoice.status} />
                </span>
              }
              description={`For ${invoice.clientName} · issued ${formatDate(invoice.issueDate)}`}
              actions={
                <Can permission="invoices:write">
                  {invoice.status === 'draft' ? (
                    <>
                      <Button asChild variant="outline">
                        <Link to={`/invoices/${invoice.id}/edit`}>
                          <Pencil /> Edit
                        </Link>
                      </Button>
                      <Button disabled={send.isPending} onClick={() => send.mutate(invoice.id)}>
                        <Send /> {send.isPending ? 'Sending…' : 'Send invoice'}
                      </Button>
                    </>
                  ) : !['paid', 'void'].includes(invoice.status) ? (
                    <Button
                      variant="outline"
                      disabled={voidInvoice.isPending}
                      onClick={() => voidInvoice.mutate(invoice.id)}
                    >
                      Void invoice
                    </Button>
                  ) : null}
                </Can>
              }
            />
            <div className="grid gap-6">
              <FormError error={send.error ?? voidInvoice.error} />
              <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <DescriptionList
                      items={[
                        {
                          label: 'Amount',
                          value: <Amount value={invoice.amount} assetCode={invoice.assetCode} />,
                        },
                        {
                          label: 'Paid so far',
                          value: (
                            <Amount value={invoice.amountPaid} assetCode={invoice.assetCode} />
                          ),
                        },
                        {
                          label: 'Due',
                          value: <DueLabel dueDate={invoice.dueDate} status={invoice.status} />,
                        },
                      ]}
                    />
                    <Table aria-label="Line items">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.lineItems.map((li, i) => (
                          <TableRow key={i}>
                            <TableCell>{li.description}</TableCell>
                            <TableCell className="text-right tabular-nums">{li.quantity}</TableCell>
                            <TableCell className="text-right">
                              <Amount value={li.unitPrice} assetCode={invoice.assetCode} />
                            </TableCell>
                            <TableCell className="text-right">
                              <Amount value={li.total} assetCode={invoice.assetCode} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {invoice.notes ? (
                      <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                    ) : null}
                  </CardContent>
                </Card>
                <div className="grid content-start gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pay link</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                      {payable ? (
                        <>
                          <code className="rounded-md bg-muted px-2 py-1.5 text-xs break-all">
                            {link}
                          </code>
                          <div className="flex gap-2">
                            <CopyButton value={link} label="Copy pay link" />
                            <Button asChild variant="outline" size="sm">
                              <a href={link} target="_blank" rel="noreferrer">
                                <ExternalLink /> Open
                              </a>
                            </Button>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {invoice.status === 'draft'
                            ? 'Send the invoice to share its pay link.'
                            : 'This invoice was voided.'}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  <PaymentReferenceCard payment={invoice.payment} />
                </div>
              </div>
              <MatchHistory matches={invoice.matches} />
            </div>
          </>
        );
      }}
    </QueryView>
  );
}
