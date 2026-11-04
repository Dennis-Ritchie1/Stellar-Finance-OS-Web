import Big from 'big.js';
import { http, HttpResponse } from 'msw';
import { authenticate, error, requireRole, WRITE_ROLES, type MockContext } from '../context';

export const transactionHandlers = ({ db, base }: MockContext) => [
  http.get(`${base}/transactions`, ({ request }) => {
    const caller = authenticate(db, request);
    if (caller instanceof Response) return caller;
    const matchStatus = new URL(request.url).searchParams.get('matchStatus');
    const data = db.transactions
      .filter((t) => !matchStatus || t.matchStatus === matchStatus)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return HttpResponse.json({ data });
  }),

  http.post(`${base}/transactions/:id/match`, async ({ request, params }) => {
    const caller = authenticate(db, request);
    if (caller instanceof Response) return caller;
    const denied = requireRole(caller, WRITE_ROLES);
    if (denied) return denied;
    const tx = db.transactions.find((t) => t.id === params.id);
    if (!tx) return error(404, 'not_found', 'Transaction not found.');
    if (tx.matchStatus === 'matched')
      return error(409, 'already_matched', 'This payment is already matched.');
    const { invoiceId } = (await request.json()) as { invoiceId: string };
    const invoice = db.invoices.find((i) => i.id === invoiceId);
    if (!invoice) return error(422, 'invalid', 'Pick an invoice to match.');
    if (invoice.assetCode !== tx.assetCode)
      return error(422, 'asset_mismatch', 'The payment asset does not match the invoice.');

    tx.matchStatus = 'matched';
    tx.invoiceId = invoice.id;
    tx.invoiceNumber = invoice.number;
    invoice.amountPaid = new Big(invoice.amountPaid).plus(tx.amount).toFixed(2);
    invoice.status = new Big(invoice.amountPaid).gte(invoice.amount) ? 'paid' : 'partially_paid';
    invoice.matches.push({
      id: `match_${tx.id}`,
      transactionId: tx.id,
      txHash: tx.txHash,
      amount: tx.amount,
      assetCode: tx.assetCode,
      matchedAt: new Date().toISOString(),
      method: 'manual',
      from: tx.from,
    });
    return HttpResponse.json(tx);
  }),
];
