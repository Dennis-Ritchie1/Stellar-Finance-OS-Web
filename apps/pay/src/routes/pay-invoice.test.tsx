import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { db } from '../test/server';
import { renderPay } from '../test/render';

describe('pay invoice page', () => {
  it('shows payment details and the memo warning for an unpaid invoice', async () => {
    renderPay('/i/pub_1001');
    expect(await screen.findByText('Invoice INV-1001')).toBeInTheDocument();
    expect(screen.getByText('Acme Studio')).toBeInTheDocument();
    expect(screen.getByText(/must include this memo/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Payment QR code')).toBeInTheDocument();
  });

  it('asks only for the remaining amount on a partially paid invoice', async () => {
    renderPay('/i/pub_1006');
    expect(await screen.findByText('Invoice INV-1006')).toBeInTheDocument();
    expect(screen.getByText('Amount due (USDC)')).toBeInTheDocument();
    expect(screen.getByText('2000.00')).toBeInTheDocument();
  });

  it('shows Paid once the invoice is matched', async () => {
    renderPay('/i/pub_1003');
    expect(await screen.findByText('Paid ✓')).toBeInTheDocument();
    expect(screen.queryByText(/must include this memo/i)).not.toBeInTheDocument();
  });

  it('flips to Paid while polling when the indexer matches the payment', async () => {
    renderPay('/i/pub_1001');
    await screen.findByText('Invoice INV-1001');
    db.invoices.find((i) => i.id === 'inv_1001')!.status = 'paid';
    expect(await screen.findByText('Paid ✓', {}, { timeout: 8000 })).toBeInTheDocument();
  }, 10_000);

  it('hides drafts and shows an error for unknown links', async () => {
    renderPay('/i/pub_1004');
    expect(
      await screen.findByText("We couldn't load this invoice", {}, { timeout: 4000 }),
    ).toBeInTheDocument();
  });

  it('asks for a link at the root', async () => {
    renderPay('/');
    expect(await screen.findByText('Invoice link needed')).toBeInTheDocument();
  });
});
