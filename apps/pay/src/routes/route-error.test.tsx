import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderPay } from '../test/render';

vi.mock('./pay-invoice', () => ({
  PayInvoicePage: () => {
    throw new Error('render failure');
  },
}));

describe('pay route error boundary', () => {
  it('shows client-friendly copy instead of a blank page or stack trace', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderPay('/i/pub_1001');
    expect(await screen.findByText("We couldn't show this invoice")).toBeInTheDocument();
    expect(screen.getByText(/payment details have not changed/i)).toBeInTheDocument();
    expect(screen.queryByText(/render failure/)).not.toBeInTheDocument();
  });
});
