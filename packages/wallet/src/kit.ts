// Thin wrapper around Stellar Wallets Kit. Apps never import the kit directly.
// The kit is loaded lazily so it doesn't weigh down first paint (important for the pay app).
// This package never sees a secret key — wallets sign, we only pass XDR in and out.
import {
  checkNetwork,
  NETWORK_PASSPHRASES,
  type StellarNetwork,
  type WalletCheck,
} from './network';

type Kit = typeof import('@creit.tech/stellar-wallets-kit/sdk').StellarWalletsKit;

let kitPromise: Promise<Kit> | null = null;

async function loadKit(network: StellarNetwork): Promise<Kit> {
  kitPromise ??= (async () => {
    const [{ StellarWalletsKit }, { defaultModules }, { Networks }] = await Promise.all([
      import('@creit.tech/stellar-wallets-kit/sdk'),
      import('@creit.tech/stellar-wallets-kit/modules/utils'),
      import('@creit.tech/stellar-wallets-kit/types'),
    ]);
    StellarWalletsKit.init({
      modules: defaultModules(),
      network: network === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET,
    });
    return StellarWalletsKit;
  })();
  return kitPromise;
}

export interface WalletClient {
  /** Opens the wallet picker and returns the connected public address. */
  connect(): Promise<{ address: string }>;
  disconnect(): Promise<void>;
  /** Compare the wallet's network with the app's. Call before every signature. */
  checkNetwork(): Promise<WalletCheck>;
  /** Sign an unsigned XDR built by the backend. Always show a readable summary first. */
  signTransaction(xdr: string, opts: { address: string }): Promise<{ signedXdr: string }>;
}

export function createWalletClient(network: StellarNetwork): WalletClient {
  return {
    async connect() {
      const kit = await loadKit(network);
      return kit.authModal();
    },
    async disconnect() {
      const kit = await loadKit(network);
      await kit.disconnect();
    },
    async checkNetwork() {
      const kit = await loadKit(network);
      const { networkPassphrase } = await kit.getNetwork();
      return checkNetwork(network, networkPassphrase);
    },
    async signTransaction(xdr, { address }) {
      const kit = await loadKit(network);
      const { signedTxXdr } = await kit.signTransaction(xdr, {
        address,
        networkPassphrase: NETWORK_PASSPHRASES[network],
      });
      return { signedXdr: signedTxXdr };
    },
  };
}
