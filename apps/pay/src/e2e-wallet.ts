import type { WalletClient } from '@finance-os/wallet';

/**
 * Playwright only (`VITE_E2E=true` in dev). Swaps Stellar Wallets Kit for a fake payer wallet that
 * "signs" without any key material (the XDR is returned unchanged; Horizon is stubbed by the tests).
 * Returns undefined everywhere else, so production builds drop this code and use the real wallet.
 */
export async function loadE2eWallet(): Promise<WalletClient | undefined> {
  if (!import.meta.env.DEV || import.meta.env.VITE_E2E !== 'true') return undefined;
  const [{ createFakeWalletClient }, { ADDRESSES }] = await Promise.all([
    import('@finance-os/wallet/testing'),
    import('@finance-os/api-client/mocks'),
  ]);
  const { client } = createFakeWalletClient('testnet', { address: ADDRESSES.clientNorthwind });
  return { ...client, signTransaction: async (xdr) => ({ signedXdr: xdr }) };
}
