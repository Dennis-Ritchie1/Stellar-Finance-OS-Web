import Big from 'big.js';
import { http, HttpResponse } from 'msw';
import { authenticate, error, type MockContext } from '../context';
import { sum } from '../db';
import { viewFor } from '../policy';
import { dailySeries } from '../series';

const DAY = 24 * 3600 * 1000;

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export const reportHandlers = ({ db, base }: MockContext) => [
  http.get(`${base}/dashboard/summary`, ({ request }) => {
    const caller = authenticate(db, request);
    if (caller instanceof Response) return caller;
    const now = new Date();
    const open = db.invoices.filter((i) =>
      ['sent', 'partially_paid', 'overdue'].includes(i.status),
    );
    const overdue = open.filter((i) => i.status === 'overdue' || new Date(i.dueDate) < now);
    const outstanding = (list: typeof open) =>
      sum(list.map((i) => new Big(i.amount).minus(i.amountPaid).toFixed(2)));
    return HttpResponse.json({
      treasuryAccounts: db.treasuryAccounts,
      cashflow: dailySeries(db, new Date(now.getTime() - 29 * DAY), now),
      cashflowAssetCode: 'USDC',
      openInvoices: { count: open.length, amount: outstanding(open), assetCode: 'USDC' },
      overdueInvoices: { count: overdue.length, amount: outstanding(overdue), assetCode: 'USDC' },
      pendingApprovals: db.paymentRequests.filter((p) => viewFor(db, p, caller).canApprove).length,
      unmatchedPayments: db.transactions.filter((t) => t.matchStatus === 'unmatched').length,
    });
  }),

  http.get(`${base}/reports/treasury`, ({ request }) => {
    const caller = authenticate(db, request);
    if (caller instanceof Response) return caller;
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    if (!from || !to || from > to) return error(422, 'invalid_range', 'Choose a valid date range.');
    const points = dailySeries(db, new Date(from), new Date(to));
    const openingBalance = new Big('52000.00');
    let running = openingBalance;
    const series = points.map((p) => {
      running = running.plus(p.inflow).minus(p.outflow);
      return { ...p, balance: running.toFixed(2) };
    });
    return HttpResponse.json({
      from,
      to,
      assetCode: 'USDC',
      totalInflow: sum(points.map((p) => p.inflow)),
      totalOutflow: sum(points.map((p) => p.outflow)),
      openingBalance: openingBalance.toFixed(2),
      closingBalance: running.toFixed(2),
      series,
    });
  }),

  http.get(`${base}/exports/reconciliation`, ({ request }) => {
    const caller = authenticate(db, request);
    if (caller instanceof Response) return caller;
    const url = new URL(request.url);
    const from = url.searchParams.get('from') ?? '';
    const to = url.searchParams.get('to') ?? '';
    if (!from || !to || from > to) return error(422, 'invalid_range', 'Choose a valid date range.');
    const header = [
      'date',
      'direction',
      'amount',
      'asset',
      'from',
      'to',
      'memo',
      'status',
      'invoice',
      'payment_request',
      'tx_hash',
    ];
    const rows = db.transactions
      .filter((t) => t.createdAt.slice(0, 10) >= from && t.createdAt.slice(0, 10) <= to)
      .map((t) => [
        t.createdAt,
        t.direction,
        t.amount,
        t.assetCode,
        t.from,
        t.to,
        t.memo ?? '',
        t.matchStatus,
        t.invoiceNumber ?? '',
        t.paymentRequestId ?? '',
        t.txHash,
      ]);
    const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n') + '\n';
    return new HttpResponse(csv, { headers: { 'Content-Type': 'text/csv' } });
  }),
];
