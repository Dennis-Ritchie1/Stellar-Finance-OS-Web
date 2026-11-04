import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { sessionStore } from '../auth/session-store';
import { renderApp } from '../test/render';

describe('app shell', () => {
  it('shows the active org and role, and switches org', async () => {
    const user = userEvent.setup();
    renderApp('/', { as: 'owner' });
    const [switcher] = await screen.findAllByRole('button', { name: 'Switch organization' });
    expect(within(switcher!).getByText('Acme Studio')).toBeInTheDocument();
    expect(within(switcher!).getByText('Owner')).toBeInTheDocument();
    await user.click(switcher!);
    await user.click(await screen.findByRole('menuitemradio', { name: 'Acme Labs' }));
    expect(sessionStore.getOrgId()).toBe('org_labs');
    expect(await within(switcher!).findByText('Admin')).toBeInTheDocument();
  });

  it('logs out from the account menu', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/', { as: 'owner' });
    await user.click(await screen.findByRole('button', { name: 'Account menu' }));
    await user.click(await screen.findByRole('menuitem', { name: /log out/i }));
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('shows the network the app is pointed at', async () => {
    renderApp('/', { as: 'viewer' });
    expect(await screen.findByText('Stellar Testnet')).toBeInTheDocument();
  });
});
