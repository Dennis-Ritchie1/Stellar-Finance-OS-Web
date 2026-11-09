import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFakeWalletClient } from '@finance-os/wallet/testing';
import { renderPay } from '../test/render';

const horizonMock = vi.hoisted(() => ({
  buildPaymentXdr: vi.fn(async () => ({ xdr: 'UNSIGNED_XDR', feeStroops: '1000' })),
  submit: vi.fn(async (..._args: unknown[]) => 'a'.repeat(64)),
}));
vi.mock('../lib/horizon', () => ({ horizon: horizonMock }));

const PAYER = 'GBFZ5U562SR4E3NPDOSNJG7SKICQH5B2XLPNGHUMHYEGDWOWEWZ3PHOF';

describe('connect wallet & pay', () => {
  beforeEach(() => vi.clearAllMocks());

  it('builds to the muxed address, shows a summary, signs and submits', async () => {
    const user = userEvent.setup();
    const fake = createFakeWalletClient('testnet', { address: PAYER });
    renderPay('/i/pub_1001', { walletClient: fake.client });

    await user.click(await screen.findByRole('button', { name: /connect wallet & pay/i }));
    expect(await screen.findByText(/check the details/i)).toBeInTheDocument();
    expect(horizonMock.buildPaymentXdr).toHaveBeenCalledWith(
      expect.objectContaining({
        source: PAYER,
        destination: expect.stringMatching(/^M/),
        amount: '4250.00',
        assetCode: 'USDC',
      }),
      'testnet',
    );
    expect(screen.getByText('Up to 0.0001 XLM')).toBeInTheDocument();
    expect(fake.calls.signed).toEqual([]);

    await user.click(screen.getByRole('button', { name: 'Confirm & sign' }));
    expect(await screen.findByText('Payment in progress')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /connect wallet & pay/i })).not.toBeInTheDocument();
    expect(fake.calls.signed).toEqual(['UNSIGNED_XDR']);
    expect(horizonMock.submit).toHaveBeenCalledWith(
      'signed:UNSIGNED_XDR',
      'testnet',
      expect.any(Function),
    );
  });

  it('blocks signing when the wallet is on another network', async () => {
    const user = userEvent.setup();
    const fake = createFakeWalletClient('testnet', { address: PAYER, walletNetwork: 'mainnet' });
    renderPay('/i/pub_1001', { walletClient: fake.client });
    await user.click(await screen.findByRole('button', { name: /connect wallet & pay/i }));
    await user.click(await screen.findByRole('button', { name: 'Confirm & sign' }));
    expect(await screen.findByText(/switch it to Stellar Testnet/i)).toBeInTheDocument();
    expect(horizonMock.submit).not.toHaveBeenCalled();
  });

  it('explains a cancelled connection in plain language', async () => {
    const user = userEvent.setup();
    const fake = createFakeWalletClient('testnet', {
      address: PAYER,
      failWith: 'User declined access',
    });
    renderPay('/i/pub_1001', { walletClient: fake.client });
    await user.click(await screen.findByRole('button', { name: /connect wallet & pay/i }));
    expect(await screen.findByText(/you cancelled the request/i)).toBeInTheDocument();
  });
});
