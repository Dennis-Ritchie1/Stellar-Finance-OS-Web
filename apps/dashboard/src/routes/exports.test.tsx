import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../test/render';

const download = vi.hoisted(() => ({ downloadText: vi.fn() }));
vi.mock('../lib/download', () => download);

afterEach(() => vi.clearAllMocks());

describe('exports page', () => {
  it('downloads a reconciliation CSV for the range', async () => {
    const user = userEvent.setup();
    renderApp('/exports', { as: 'accountant' });
    await user.click(await screen.findByRole('button', { name: '12 months' }));
    await user.click(screen.getByRole('button', { name: /download csv/i }));
    expect(await screen.findByText(/Downloaded reconciliation_/)).toBeInTheDocument();
    const [filename, csv] = download.downloadText.mock.calls[0]!;
    expect(filename).toMatch(/^reconciliation_\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}\.csv$/);
    expect(csv.split('\n')[0]).toContain('date,direction,amount');
    expect(csv).toContain('INV-1003');
  });

  it('blocks viewers', async () => {
    renderApp('/exports', { as: 'viewer' });
    expect(await screen.findByText("You can't run exports")).toBeInTheDocument();
  });
});
