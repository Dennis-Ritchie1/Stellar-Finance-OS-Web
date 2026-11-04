import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/render';

describe('invoice detail', () => {
  it('shows the payment reference, memo warning and matches', async () => {
    renderApp('/invoices/inv_1002', { as: 'viewer' });
    expect(await screen.findByRole('heading', { name: /Invoice INV-1002/ })).toBeInTheDocument();
    expect(screen.getByText('1002')).toBeInTheDocument();
    expect(screen.getByText(/you must include this memo/i)).toBeInTheDocument();
    expect(screen.getByText(/Matched automatically/)).toBeInTheDocument();
    const explorerLinks = screen.getAllByRole('link', { name: /view on explorer/i });
    expect(explorerLinks.some((a) => a.getAttribute('href')?.includes('/tx/'))).toBe(true);
    expect(screen.queryByRole('button', { name: /void/i })).not.toBeInTheDocument();
  });

  it('shows not-found errors', async () => {
    renderApp('/invoices/nope', { as: 'viewer' });
    expect(await screen.findByText("We couldn't find this invoice")).toBeInTheDocument();
  });
});
