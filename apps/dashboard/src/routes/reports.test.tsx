import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/render';

describe('reports page', () => {
  it('shows totals for the default 30-day range', async () => {
    renderApp('/reports', { as: 'viewer' });
    const opening = (await screen.findByText('Opening balance')).closest('[data-slot="card"]')!;
    expect(within(opening as HTMLElement).getByText('52,000.00 USDC')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30 days' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('table', { name: /end-of-day balance/i })).toBeInTheDocument();
  });

  it('switches range via presets and the URL', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/reports', { as: 'viewer' });
    await user.click(await screen.findByRole('button', { name: '90 days' }));
    expect(router.state.location.search).toMatch(/from=.*&to=/);
    expect(screen.getByRole('button', { name: '90 days' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('rejects an inverted range without calling the API', async () => {
    renderApp('/reports?from=2026-12-01&to=2026-01-01', { as: 'viewer' });
    expect(await screen.findByText('Choose a valid date range')).toBeInTheDocument();
  });
});
