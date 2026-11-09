import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeWalletClient } from '@finance-os/wallet/testing';
import { savePending } from '../lib/pending-payment';
import { db } from '../test/server';
import { renderPay } from '../test/render';

const HASH = 'b'.repeat(64);
const PAYER = 'GBFZ5U562SR4E3NPDOSNJG7SKICQH5B2XLPNGHUMHYEGDWOWEWZ3PHOF';

const horizonMock = vi.hoisted(() => ({
  buildPaymentXdr: vi.fn(async () => ({ xdr: 'UNSIGNED_XDR', feeStroops: '1000' })),
  submit: vi.fn(async (..._args: unknown[]) => HASH),
}));
vi.mock('../lib/horizon', () => ({ horizon: horizonMock }));

const payButton = () => screen.queryByRole('button', { name: /connect wallet & pay/i });

function seedPending(overrides: Partial<Parameters<typeof savePending>[1]> = {}) {
  savePending('pub_1001', {
    hash: HASH,
    amount: '4250.00',
    submittedAt: Date.now() - 60_000,
    amountPaidAtSubmit: '0.00',
    ...overrides,
  });
}

describe('duplicate payment protection', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows Payment in progress, not the pay button, after a reload', async () => {
    const user = userEvent.setup();
    const fake = createFakeWalletClient('testnet', { address: PAYER });
    const first = renderPay('/i/pub_1001', { walletClient: fake.client });
    await user.click(await screen.findByRole('button', { name: /connect wallet & pay/i }));
    await user.click(await screen.findByRole('button', { name: 'Confirm & sign' }));
    expect(await screen.findByText('Payment in progress')).toBeInTheDocument();

    // "Reload": throw away all React state; only browser storage survives.
    first.unmount();
    renderPay('/i/pub_1001', { walletClient: fake.client });
    expect(await screen.findByText('Payment in progress')).toBeInTheDocument();
    expect(payButton()).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view on explorer/i })).toHaveAttribute(
      'href',
      expect.stringContaining(`/tx/${HASH}`),
    );
  });

  it('stores only public data, never the signed XDR', async () => {
    const user = userEvent.setup();
    const fake = createFakeWalletClient('testnet', { address: PAYER });
    renderPay('/i/pub_1001', { walletClient: fake.client });
    await user.click(await screen.findByRole('button', { name: /connect wallet & pay/i }));
    await user.click(await screen.findByRole('button', { name: 'Confirm & sign' }));
    await screen.findByText('Payment in progress');
    for (const store of [window.localStorage, window.sessionStorage]) {
      const raw = store.getItem('finance-os:pending-payment:pub_1001') ?? '';
      expect(raw).toContain(HASH);
      expect(raw).not.toMatch(/signed:|UNSIGNED_XDR/);
    }
  });

  it('clears the stored submission and shows Paid when the invoice is paid while pending', async () => {
    seedPending();
    renderPay('/i/pub_1001');
    expect(await screen.findByText('Payment in progress')).toBeInTheDocument();

    const invoice = db.invoices.find((i) => i.id === 'inv_1001')!;
    invoice.status = 'paid';
    invoice.amountPaid = invoice.amount;
    expect(await screen.findByText('Paid ✓', {}, { timeout: 8000 })).toBeInTheDocument();
    await waitFor(() =>
      expect(window.localStorage.getItem('finance-os:pending-payment:pub_1001')).toBeNull(),
    );
    expect(window.sessionStorage.getItem('finance-os:pending-payment:pub_1001')).toBeNull();
  }, 12_000);

  it('ignores an expired submission', async () => {
    seedPending({ submittedAt: Date.now() - 16 * 60_000 });
    renderPay('/i/pub_1001');
    expect(
      await screen.findByRole('button', { name: /connect wallet & pay/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Payment in progress')).not.toBeInTheDocument();
  });

  it('asks for confirmation naming the amount before letting the payer pay again', async () => {
    const user = userEvent.setup();
    seedPending();
    renderPay('/i/pub_1001');
    await user.click(await screen.findByRole('button', { name: /i need to pay again/i }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/you already sent/i)).toHaveTextContent('4,250.00');
    // Declining keeps the block in place.
    await user.click(within(dialog).getByRole('button', { name: /keep waiting/i }));
    expect(payButton()).not.toBeInTheDocument();
    expect(screen.getByText('Payment in progress')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /i need to pay again/i }));
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: /pay again anyway/i }),
    );
    expect(
      await screen.findByRole('button', { name: /connect wallet & pay/i }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem('finance-os:pending-payment:pub_1001')).toBeNull();
  });

  it('shows "Checking…" (not "try again") while a timed-out submit is being resolved', async () => {
    const user = userEvent.setup();
    let release: (hash: string) => void = () => {};
    horizonMock.submit.mockImplementationOnce(async (...args: unknown[]) => {
      (args[2] as () => void)();
      return new Promise<string>((resolve) => (release = resolve));
    });
    const fake = createFakeWalletClient('testnet', { address: PAYER });
    renderPay('/i/pub_1001', { walletClient: fake.client });
    await user.click(await screen.findByRole('button', { name: /connect wallet & pay/i }));
    await user.click(await screen.findByRole('button', { name: 'Confirm & sign' }));

    expect(
      await screen.findByText('Checking whether your payment went through…'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/try again/i)).not.toBeInTheDocument();
    expect(payButton()).not.toBeInTheDocument();

    release(HASH);
    expect(await screen.findByText('Payment in progress')).toBeInTheDocument();
  });

  it('keeps the hash and blocks a repeat when the outcome stays unknown', async () => {
    const user = userEvent.setup();
    const { PaymentError } = await vi.importActual<typeof import('@finance-os/wallet/payment')>(
      '@finance-os/wallet/payment',
    );
    horizonMock.submit.mockRejectedValueOnce(
      new PaymentError(
        "We couldn't confirm whether your payment went through.",
        'timeout_unknown',
        HASH,
      ),
    );
    const fake = createFakeWalletClient('testnet', { address: PAYER });
    renderPay('/i/pub_1001', { walletClient: fake.client });
    await user.click(await screen.findByRole('button', { name: /connect wallet & pay/i }));
    await user.click(await screen.findByRole('button', { name: 'Confirm & sign' }));
    expect(await screen.findByText('Payment in progress')).toBeInTheDocument();
    expect(payButton()).not.toBeInTheDocument();
  });
});
