// MSW worker for Playwright end-to-end runs. Dev/e2e only — never imported by production code.
//
// The normal browser worker keeps its mock database in page memory, so it resets on every reload and
// the dashboard (:5173) and pay app (:5174) each get their own copy. For e2e the two apps must see the
// same backend, so this worker mirrors the database to a tiny relay process (see e2e/state-relay.ts):
// it pulls newer state before every API call and pushes any change afterwards.
import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import Big from 'big.js';
import { createHandlers } from './index';
import { createDb, type MockDb } from './db';
import { TESTNET_USDC_ISSUER } from './constants';

interface Snapshot {
  version: number;
  state: MockDb | null;
}

export interface E2eWorkerOptions {
  baseUrl: string;
  /** Origin of the e2e state relay, e.g. http://localhost:5190 */
  relayUrl: string;
  /** Horizon origin the pay app talks to; stubbed so no test touches the real network. */
  horizonUrl?: string;
}

export async function startE2eWorker({ baseUrl, relayUrl, horizonUrl }: E2eWorkerOptions) {
  const base = baseUrl.replace(/\/+$/, '');
  const db = createDb();
  let version = 0;
  let lastPushed = '';
  let queue: Promise<unknown> = Promise.resolve();

  /** Run sync steps one at a time so a pull never interleaves with a push. */
  const serialize = <T>(task: () => Promise<T>): Promise<T> => {
    const next = queue.then(task, task);
    queue = next.catch(() => undefined);
    return next;
  };

  const pull = () =>
    serialize(async () => {
      // A fetch can fail while the page is navigating away; the next request just pulls again.
      const res = await fetch(`${relayUrl}/state?since=${version}`).catch(() => null);
      if (!res || res.status === 204) return;
      const snap = (await res.json()) as Snapshot;
      if (snap.state) {
        // Replace in place: handlers hold a reference to `db`, not to its arrays.
        Object.assign(db, snap.state);
        lastPushed = JSON.stringify(db);
      }
      version = snap.version;
    });

  const push = () =>
    serialize(async () => {
      const body = JSON.stringify(db);
      if (body === lastPushed) return;
      const res = await fetch(`${relayUrl}/state`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body,
      }).catch(() => null);
      if (!res) return;
      lastPushed = body;
      version = ((await res.json()) as Snapshot).version;
    });

  await pull();
  if (version === 0) await push(); // first page of the run seeds the relay

  const worker = setupWorker(
    // 1. Pull shared state before every API request, then fall through to the real handlers.
    http.all(`${base}/*`, async () => {
      await pull();
    }),
    // 2. Test-only: pretend the indexer saw a payment to an invoice's pay address.
    http.post(`${base}/__test__/index-payment`, async ({ request }) => {
      const { publicToken, amount, from } = (await request.json()) as {
        publicToken: string;
        amount?: string;
        from?: string;
      };
      const invoice = db.invoices.find((i) => i.publicToken === publicToken);
      if (!invoice) return HttpResponse.json({ message: 'unknown invoice' }, { status: 404 });
      const paid = amount ?? Big(invoice.amount).minus(invoice.amountPaid).toFixed(2);
      const id = `tx_e2e_${db.transactions.length + 1}`;
      const txHash = Array.from({ length: 64 }, (_, i) =>
        ((i * 7 + id.length) % 16).toString(16),
      ).join('');
      const now = new Date().toISOString();
      db.transactions.unshift({
        id,
        txHash,
        direction: 'incoming',
        amount: paid,
        assetCode: invoice.assetCode,
        from: from ?? 'GBFZ5U562SR4E3NPDOSNJG7SKICQH5B2XLPNGHUMHYEGDWOWEWZ3PHOF',
        to: invoice.payment.address,
        memo: invoice.payment.memo,
        createdAt: now,
        matchStatus: 'matched',
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
      });
      invoice.amountPaid = Big(invoice.amountPaid).plus(paid).toFixed(2);
      invoice.status = Big(invoice.amountPaid).gte(invoice.amount) ? 'paid' : 'partially_paid';
      invoice.matches.push({
        id: `match_${id}`,
        transactionId: id,
        txHash,
        amount: paid,
        assetCode: invoice.assetCode,
        matchedAt: now,
        method: 'automatic',
        from: from ?? 'GBFZ5U562SR4E3NPDOSNJG7SKICQH5B2XLPNGHUMHYEGDWOWEWZ3PHOF',
      });
      return HttpResponse.json({ ok: true });
    }),
    ...createHandlers({ baseUrl, db }),
    ...(horizonUrl ? horizonStub(horizonUrl.replace(/\/+$/, '')) : []),
  );

  // 3. Push after every mocked response (also catches the fake indexer's delayed settle timer).
  worker.events.on('response:mocked', () => void push());
  setInterval(() => void push(), 500);

  await worker.start({ onUnhandledFrame: 'bypass', quiet: true });
  console.info('[mocks] e2e worker: API served by MSW, state shared via relay.');
  return worker;
}

/** A fake Horizon: the payer's account is active and holds USDC; submitting always succeeds. */
function horizonStub(horizon: string) {
  return [
    http.get(`${horizon}/accounts/:id`, ({ params }) =>
      HttpResponse.json({
        id: params.id,
        account_id: params.id,
        sequence: '1000',
        subentry_count: 1,
        thresholds: { low_threshold: 0, med_threshold: 0, high_threshold: 0 },
        flags: {},
        balances: [
          {
            asset_type: 'credit_alphanum4',
            asset_code: 'USDC',
            asset_issuer: TESTNET_USDC_ISSUER,
            balance: '100000.0000000',
          },
          { asset_type: 'native', balance: '100.0000000' },
        ],
        signers: [],
        data: {},
      }),
    ),
    // The pay page prices its fee from fee_stats; without this the request would reach real Horizon.
    http.get(`${horizon}/fee_stats`, () => {
      const fees = { min: '100', mode: '100', p50: '100', p70: '100', p95: '100', p99: '100' };
      return HttpResponse.json({
        last_ledger: '1',
        last_ledger_base_fee: '100',
        ledger_capacity_usage: '0.1',
        fee_charged: { ...fees, max: '100' },
        max_fee: { ...fees, max: '100' },
      });
    }),
    http.post(`${horizon}/transactions`, () =>
      HttpResponse.json({ hash: 'e'.repeat(64), successful: true, ledger: 1 }),
    ),
  ];
}
