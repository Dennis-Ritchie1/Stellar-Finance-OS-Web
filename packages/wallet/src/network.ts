export type StellarNetwork = 'testnet' | 'mainnet';

export const NETWORK_PASSPHRASES: Record<StellarNetwork, string> = {
  testnet: 'Test SDF Network ; September 2015',
  mainnet: 'Public Global Stellar Network ; September 2015',
};

export function parseNetwork(value: string | undefined): StellarNetwork {
  if (value === 'testnet' || value === 'mainnet') return value;
  if (value === 'public' || value === 'pubnet') return 'mainnet';
  throw new Error(`VITE_STELLAR_NETWORK must be "testnet" or "mainnet" (got "${value ?? ''}")`);
}

export function networkLabel(network: StellarNetwork): string {
  return network === 'mainnet' ? 'Stellar Mainnet' : 'Stellar Testnet';
}

export type WalletCheck =
  | { ok: true }
  | { ok: false; reason: 'network-mismatch'; message: string }
  | { ok: false; reason: 'wrong-account'; message: string; expectedAddress: string };

/** Block signing when the wallet is on a different network than the app. */
export function checkNetwork(appNetwork: StellarNetwork, walletPassphrase: string): WalletCheck {
  if (walletPassphrase === NETWORK_PASSPHRASES[appNetwork]) return { ok: true };
  return {
    ok: false,
    reason: 'network-mismatch',
    message: `Your wallet is connected to a different network. Switch it to ${networkLabel(appNetwork)} and try again.`,
  };
}

/** The connected wallet must be the treasury account that is paying. */
export function checkSigner(expectedAddress: string, connectedAddress: string): WalletCheck {
  if (expectedAddress === connectedAddress) return { ok: true };
  return {
    ok: false,
    reason: 'wrong-account',
    expectedAddress,
    message: `This payment must be signed by the treasury account ${expectedAddress}. Switch to that account in your wallet.`,
  };
}
