import type { WalletClient } from '@finance-os/wallet';

/**
 * Playwright only (`VITE_E2E=true` in dev). Swaps Stellar Wallets Kit for a fake wallet that holds the
 * treasury account's address and "signs" without any key material. Returns undefined everywhere else,
 * so production builds drop this code and use the real wallet.
 */
export async function loadE2eWallet(): Promise<WalletClient | undefined> {
  if (!import.meta.env.DEV || import.meta.env.VITE_E2E !== 'true') return undefined;
  const [{ createFakeWalletClient }, { ADDRESSES }] = await Promise.all([
    import('@finance-os/wallet/testing'),
    import('@finance-os/api-client/mocks'),
  ]);
  const { client } = createFakeWalletClient('testnet', { address: ADDRESSES.operating });
  return client;
}
