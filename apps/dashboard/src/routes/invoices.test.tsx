import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/render';

describe('invoices page', () => {
  it('lists invoices with status, amount and overdue label', async () => {
    renderApp('/invoices', { as: 'accountant' });
    const row = (await screen.findByRole('link', { name: 'INV-1002' })).closest('tr')!;
    expect(within(row).getByText('Overdue')).toBeInTheDocument();
    expect(within(row).getByText('8,000.00 USDC')).toBeInTheDocument();
    expect(within(row).getByText('3 days overdue')).toBeInTheDocument();
  });

  it('filters by status via the URL', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/invoices', { as: 'accountant' });
    await screen.findByRole('link', { name: 'INV-1001' });
    await user.click(screen.getByRole('button', { name: 'Paid' }));
    expect(await screen.findByRole('link', { name: 'INV-1003' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'INV-1001' })).not.toBeInTheDocument();
    expect(router.state.location.search).toBe('?status=paid');
  });

  it('sends a draft from the quick actions menu', async () => {
    const user = userEvent.setup();
    renderApp('/invoices', { as: 'accountant' });
    await user.click(await screen.findByRole('button', { name: 'Actions for INV-1004' }));
    await user.click(await screen.findByRole('menuitem', { name: /send invoice/i }));
    const row = (await screen.findByRole('link', { name: 'INV-1004' })).closest('tr')!;
    expect(await within(row).findByText('Sent')).toBeInTheDocument();
  });

  it('hides write actions from viewers', async () => {
    const user = userEvent.setup();
    renderApp('/invoices', { as: 'viewer' });
    await user.click(await screen.findByRole('button', { name: 'Actions for INV-1001' }));
    expect(await screen.findByRole('menuitem', { name: /copy pay link/i })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /void/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /new invoice/i })).not.toBeInTheDocument();
  });
});
