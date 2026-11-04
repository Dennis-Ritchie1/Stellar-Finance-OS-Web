import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PublicInvoice } from '@finance-os/api-client';
import { Providers } from '../providers';
import { routes } from '../router';

const invoice: PublicInvoice = {
  businessName: 'Acme Studio',
  number: 'INV-0042',
  status: 'sent',
  amount: '1250.00',
  assetCode: 'USDC',
  dueDate: '2026-12-01T00:00:00Z',
  lineItems: [
    { description: 'Design work', quantity: '1', unitPrice: '1250.00', total: '1250.00' },
  ],
  payment: { muxedAddress: 'MDEST', address: 'GDEST', memo: '42', assetIssuer: 'GISSUER' },
};

function mockApi(status: number, body?: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () =>
        new Response(body ? JSON.stringify(body) : null, {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
    ),
  );
}

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('pay invoice page', () => {
  it('shows payment details and the memo warning for an unpaid invoice', async () => {
    mockApi(200, invoice);
    renderAt('/i/tok_123');
    expect(await screen.findByText('Invoice INV-0042')).toBeInTheDocument();
    expect(screen.getByText(/must include this memo/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Payment QR code')).toBeInTheDocument();
  });

  it('shows Paid once the invoice is matched', async () => {
    mockApi(200, { ...invoice, status: 'paid' });
    renderAt('/i/tok_123');
    expect(await screen.findByText('Paid ✓')).toBeInTheDocument();
    expect(screen.queryByText(/must include this memo/i)).not.toBeInTheDocument();
  });

  it('shows an error for an unknown link', async () => {
    mockApi(404);
    renderAt('/i/missing');
    expect(
      await screen.findByText("We couldn't load this invoice", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it('asks for a link at the root', async () => {
    renderAt('/');
    expect(await screen.findByText('Invoice link needed')).toBeInTheDocument();
  });
});
