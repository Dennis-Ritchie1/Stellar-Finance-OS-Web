// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { createFakeWalletClient, type FakeWalletOptions } from './testing';
import { useWallet, WalletCheckError } from './wallet-context';
import { WalletProvider } from './wallet-provider';

function setup(options: FakeWalletOptions) {
  const fake = createFakeWalletClient('testnet', options);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <WalletProvider network="testnet" client={fake.client}>
      {children}
    </WalletProvider>
  );
  return { ...renderHook(() => useWallet(), { wrapper }), fake };
}

describe('WalletProvider', () => {
  it('connects and signs', async () => {
    const { result, fake } = setup({ address: 'GPAYER' });
    await act(() => result.current.connect());
    expect(result.current).toMatchObject({ address: 'GPAYER', status: 'connected' });
    const signed = await result.current.signTransaction('XDR');
    expect(signed).toBe('signed:XDR');
    expect(fake.calls.signed).toEqual(['XDR']);
  });

  it('refuses to sign before connecting', async () => {
    const { result } = setup({ address: 'GPAYER' });
    await expect(result.current.signTransaction('XDR')).rejects.toBeInstanceOf(WalletCheckError);
  });

  it('blocks signing on a network mismatch', async () => {
    const { result, fake } = setup({ address: 'GPAYER', walletNetwork: 'mainnet' });
    await act(() => result.current.connect());
    await expect(result.current.signTransaction('XDR')).rejects.toMatchObject({
      reason: 'network-mismatch',
    });
    expect(fake.calls.signed).toEqual([]);
  });

  it('blocks signing from the wrong treasury account', async () => {
    const { result } = setup({ address: 'GOTHER' });
    await act(() => result.current.connect());
    await expect(
      result.current.signTransaction('XDR', { expectedSigner: 'GTREASURY' }),
    ).rejects.toMatchObject({
      reason: 'wrong-account',
      message: expect.stringContaining('GTREASURY'),
    });
  });

  it('stays disconnected when the user cancels', async () => {
    const { result } = setup({ address: 'GPAYER', failWith: 'User declined' });
    await act(() => expect(result.current.connect()).rejects.toThrow('User declined'));
    expect(result.current.status).toBe('disconnected');
  });
});

describe('WalletProvider stale closures', () => {
  it('signs right after connecting with the same hook snapshot', async () => {
    const { result, fake } = setup({ address: 'GPAYER' });
    const { connect, signTransaction } = result.current;
    await act(async () => {
      await connect();
      expect(await signTransaction('XDR')).toBe('signed:XDR');
    });
    expect(fake.calls.signed).toEqual(['XDR']);
  });
});
