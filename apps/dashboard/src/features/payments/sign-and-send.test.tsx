import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ADDRESSES } from '@finance-os/api-client/mocks';
import { createFakeWalletClient } from '@finance-os/wallet/testing';
import { renderApp } from '../../test/render';
import { db } from '../../test/server';

describe('sign & send', () => {
  it('shows a readable summary, signs with the treasury wallet and settles', async () => {
    const user = userEvent.setup();
    const fake = createFakeWalletClient('testnet', { address: ADDRESSES.operating });
    renderApp('/payments/outgoing?request=pr_2', { as: 'accountant', walletClient: fake.client });
    const drawer = await screen.findByRole('dialog');

    await user.click(await within(drawer).findByRole('button', { name: 'Sign & send' }));
    expect(await within(drawer).findByText(/sign exactly this payment/i)).toBeInTheDocument();
    expect(within(drawer).getAllByText('850.00 USDC').length).toBeGreaterThan(0);
    expect(fake.calls.signed).toHaveLength(0);

    await user.click(within(drawer).getByRole('button', { name: 'Open wallet to sign' }));
    expect(await within(drawer).findByText('Payment sent — confirming')).toBeInTheDocument();
    expect(fake.calls.signed).toHaveLength(1);
    expect(db.paymentRequests.find((p) => p.id === 'pr_2')!.status).toBe('submitted');

    // The mock indexer settles after a few seconds; the drawer polls until then.
    const explorer = await within(drawer).findByRole(
      'link',
      { name: /view on explorer/i },
      { timeout: 10_000 },
    );
    expect(explorer).toHaveAttribute('href', expect.stringContaining('/tx/'));
    expect(within(drawer).getAllByText('Paid')).toHaveLength(2); // status badge + confirmation
    expect(db.paymentRequests.find((p) => p.id === 'pr_2')!.status).toBe('settled');
  }, 15_000);

  it('explains which account to switch to when the wrong wallet is connected', async () => {
    const user = userEvent.setup();
    const fake = createFakeWalletClient('testnet', { address: ADDRESSES.payroll });
    renderApp('/payments/outgoing?request=pr_2', { as: 'accountant', walletClient: fake.client });
    const drawer = await screen.findByRole('dialog');
    await user.click(await within(drawer).findByRole('button', { name: 'Sign & send' }));
    await user.click(await within(drawer).findByRole('button', { name: 'Open wallet to sign' }));
    expect(await within(drawer).findByText(new RegExp(ADDRESSES.operating))).toBeInTheDocument();
    expect(fake.calls.signed).toHaveLength(0);
  });

  it('does not offer signing to approvers', async () => {
    renderApp('/payments/outgoing?request=pr_2', { as: 'approver' });
    const drawer = await screen.findByRole('dialog');
    expect(await within(drawer).findByText(/someone with signing rights/i)).toBeInTheDocument();
  });
});
