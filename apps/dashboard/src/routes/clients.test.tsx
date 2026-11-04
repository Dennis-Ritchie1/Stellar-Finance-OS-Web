import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/render';

describe('clients page', () => {
  it('lists clients', async () => {
    renderApp('/clients', { as: 'viewer' });
    expect(await screen.findByText('Northwind Traders')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /new client/i })).not.toBeInTheDocument();
  });

  it('creates a client with a validated sender address', async () => {
    const user = userEvent.setup();
    renderApp('/clients', { as: 'accountant' });
    await user.click(await screen.findByRole('button', { name: /new client/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name'), 'Umbrella Corp');
    await user.type(within(dialog).getByLabelText('Billing email'), 'ap@umbrella.test');
    await user.type(within(dialog).getByLabelText(/sender addresses/i), 'nope');
    await user.click(within(dialog).getByRole('button', { name: 'Add client' }));
    expect(await within(dialog).findByText(/must be a Stellar G-address/)).toBeInTheDocument();
    await user.clear(within(dialog).getByLabelText(/sender addresses/i));
    await user.click(within(dialog).getByRole('button', { name: 'Add client' }));
    expect(await screen.findByText('Umbrella Corp')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
