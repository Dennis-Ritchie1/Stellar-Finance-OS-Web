import Big from 'big.js';
import { http, HttpResponse } from 'msw';
import type { InvoiceDetail, InvoiceInput, InvoiceStatus } from '../../types';
import { authenticate, error, newId, requireRole, WRITE_ROLES, type MockContext } from '../context';
import { paymentReference, sum, type MockDb } from '../db';

/** Strip detail-only fields for list responses. */
const summary = ({ lineItems: _l, payment: _p, matches: _m, ...rest }: InvoiceDetail) => rest;

function applyInput(db: MockDb, input: InvoiceInput) {
  const client = db.clients.find((c) => c.id === input.clientId);
  const lineItems = input.lineItems.map((li) => ({
    ...li,
    total: new Big(li.quantity).times(li.unitPrice).toFixed(2),
  }));
  return {
    clientId: input.clientId,
    clientName: client?.name ?? 'Unknown client',
    assetCode: input.assetCode,
    dueDate: input.dueDate,
    notes: input.notes ?? '',
    lineItems,
    amount: sum(lineItems.map((l) => l.total)),
  };
}

export const invoiceHandlers = ({ db, base }: MockContext) => [
  http.get(`${base}/invoices`, ({ request }) => {
    const caller = authenticate(db, request);
    if (caller instanceof Response) return caller;
    const status = new URL(request.url).searchParams.get('status') as InvoiceStatus | null;
    const data = db.invoices
      .filter((i) => !status || i.status === status)
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
      .map(summary);
    return HttpResponse.json({ data });
  }),

  http.get(`${base}/invoices/:id`, ({ request, params }) => {
    const caller = authenticate(db, request);
    if (caller instanceof Response) return caller;
    const invoice = db.invoices.find((i) => i.id === params.id);
    return invoice ? HttpResponse.json(invoice) : error(404, 'not_found', 'Invoice not found.');
  }),

  http.post(`${base}/invoices`, async ({ request }) => {
    const caller = authenticate(db, request);
    if (caller instanceof Response) return caller;
    const denied = requireRole(caller, WRITE_ROLES);
    if (denied) return denied;
    const input = (await request.json()) as InvoiceInput;
    const n = db.nextInvoiceNumber++;
    const invoice: InvoiceDetail = {
      id: newId('inv'),
      number: `INV-${n}`,
      status: 'draft',
      amountPaid: '0.00',
      issueDate: new Date().toISOString(),
      publicToken: `pub_${n}`,
      payment: paymentReference(n),
      matches: [],
      ...applyInput(db, input),
    };
    db.invoices.push(invoice);
    return HttpResponse.json(invoice, { status: 201 });
  }),

  http.patch(`${base}/invoices/:id`, async ({ request, params }) => {
    const caller = authenticate(db, request);
    if (caller instanceof Response) return caller;
    const denied = requireRole(caller, WRITE_ROLES);
    if (denied) return denied;
    const invoice = db.invoices.find((i) => i.id === params.id);
    if (!invoice) return error(404, 'not_found', 'Invoice not found.');
    if (invoice.status !== 'draft') return error(409, 'not_draft', 'Only drafts can be edited.');
    Object.assign(invoice, applyInput(db, (await request.json()) as InvoiceInput));
    return HttpResponse.json(invoice);
  }),

  http.post(`${base}/invoices/:id/send`, ({ request, params }) => {
    const caller = authenticate(db, request);
    if (caller instanceof Response) return caller;
    const denied = requireRole(caller, WRITE_ROLES);
    if (denied) return denied;
    const invoice = db.invoices.find((i) => i.id === params.id);
    if (!invoice) return error(404, 'not_found', 'Invoice not found.');
    if (invoice.status !== 'draft')
      return error(409, 'not_draft', 'This invoice was already sent.');
    invoice.status = 'sent';
    invoice.issueDate = new Date().toISOString();
    return HttpResponse.json(invoice);
  }),

  http.post(`${base}/invoices/:id/void`, ({ request, params }) => {
    const caller = authenticate(db, request);
    if (caller instanceof Response) return caller;
    const denied = requireRole(caller, WRITE_ROLES);
    if (denied) return denied;
    const invoice = db.invoices.find((i) => i.id === params.id);
    if (!invoice) return error(404, 'not_found', 'Invoice not found.');
    if (invoice.status === 'paid') return error(409, 'paid', "Paid invoices can't be voided.");
    invoice.status = 'void';
    return HttpResponse.json(invoice);
  }),

  http.get(`${base}/public/invoices/:token`, ({ params }) => {
    const invoice = db.invoices.find((i) => i.publicToken === params.token);
    if (!invoice || invoice.status === 'draft')
      return error(404, 'not_found', 'Invoice not found.');
    const org = db.orgs[0]!;
    return HttpResponse.json({
      businessName: org.name,
      number: invoice.number,
      status: invoice.status,
      amount: invoice.amount,
      amountPaid: invoice.amountPaid,
      assetCode: invoice.assetCode,
      dueDate: invoice.dueDate,
      lineItems: invoice.lineItems,
      payment: invoice.payment,
    });
  }),
];
