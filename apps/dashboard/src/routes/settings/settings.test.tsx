import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../test/render';
import { db } from '../../test/server';

describe('settings', () => {
  it('role changes reflect in the UI', async () => {
    const user = userEvent.setup();
    const owner = renderApp('/settings/members', { as: 'owner' });
    await user.selectOptions(await screen.findByLabelText('Role for Ben Adeyemi'), 'accountant');
    await waitFor(() =>
      expect(db.members.find((m) => m.userId === 'u_ben')!.role).toBe('accountant'),
    );
    owner.unmount();

    // Ben was an approver (no invoice rights); as an accountant he can now create invoices.
    renderApp('/invoices', { as: 'approver' });
    expect(await screen.findByRole('link', { name: /new invoice/i })).toBeInTheDocument();
  });

  it('refuses to demote the last owner', async () => {
    const user = userEvent.setup();
    renderApp('/settings/members', { as: 'owner' });
    await user.selectOptions(await screen.findByLabelText('Role for Ada Okoro'), 'viewer');
    expect(
      await screen.findByText('An organization needs at least one owner.'),
    ).toBeInTheDocument();
  });

  it('is read-only for non-admins', async () => {
    renderApp('/settings', { as: 'accountant' });
    expect(await screen.findByLabelText('Display name')).toBeDisabled();
    expect(screen.getByText(/only owners and admins/i)).toBeInTheDocument();
  });

  it('saves the organization profile', async () => {
    const user = userEvent.setup();
    renderApp('/settings', { as: 'owner' });
    const name = await screen.findByLabelText('Display name');
    await user.clear(name);
    await user.type(name, 'Acme Studio Intl');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Saved.')).toBeInTheDocument();
    const [switcher] = screen.getAllByRole('button', { name: 'Switch organization' });
    expect(await within(switcher!).findByText('Acme Studio Intl')).toBeInTheDocument();
  });

  it('adds an approval policy', async () => {
    const user = userEvent.setup();
    renderApp('/settings/policies', { as: 'owner' });
    await user.type(await screen.findByLabelText('Policy name'), 'Huge payments');
    await user.type(screen.getByLabelText(/applies from/i), '20000');
    await user.selectOptions(screen.getByLabelText('Approvals needed'), '3');
    await user.click(screen.getByRole('button', { name: 'Add policy' }));
    expect(await screen.findByText('Huge payments')).toBeInTheDocument();
  });
});
