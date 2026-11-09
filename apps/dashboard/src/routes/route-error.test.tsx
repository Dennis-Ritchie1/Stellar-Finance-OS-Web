import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setErrorReporter } from '@finance-os/utils';
import { renderApp } from '../test/render';

const state = vi.hoisted(() => ({ shouldThrow: true }));
vi.mock('./home', () => ({
  HomePage: () => {
    if (state.shouldThrow)
      throw new Error(
        `Boom for org_acme at GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H`,
      );
    return <h1>Recovered home</h1>;
  },
}));

describe('route error boundary', () => {
  afterEach(() => setErrorReporter());

  it('shows the boundary inside the shell, reports once scrubbed, and Try again recovers', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reporter = vi.fn();
    setErrorReporter(reporter);
    renderApp('/', { as: 'owner' });

    expect(await screen.findByText('Something went wrong on this page')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /invoices/i }).length).toBeGreaterThan(0);
    expect(reporter).toHaveBeenCalledOnce();
    const report = reporter.mock.calls[0]![0];
    expect(JSON.stringify(report)).not.toMatch(/org_acme|GBRPYHIL/);
    expect(report.context.referenceId).toMatch(/^[0-9A-F]{8}$/);

    state.shouldThrow = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Recovered home')).toBeInTheDocument();
  });
});
