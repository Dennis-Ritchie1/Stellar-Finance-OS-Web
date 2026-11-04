// Fake wallet for tests and demos. Never used in production code.
import type { WalletClient } from './kit';
import { NETWORK_PASSPHRASES, checkNetwork, type StellarNetwork } from './network';

export interface FakeWalletOptions {
  address: string;
  /** Network the fake wallet claims to be on. */
  walletNetwork?: StellarNetwork;
  /** Make connect/sign fail with this message (e.g. "User declined"). */
  failWith?: string;
}

export function createFakeWalletClient(appNetwork: StellarNetwork, options: FakeWalletOptions) {
  const calls = { signed: [] as string[] };
  const client: WalletClient = {
    async connect() {
      if (options.failWith) throw new Error(options.failWith);
      return { address: options.address };
    },
    async disconnect() {},
    async checkNetwork() {
      return checkNetwork(appNetwork, NETWORK_PASSPHRASES[options.walletNetwork ?? appNetwork]);
    },
    async signTransaction(xdr) {
      if (options.failWith) throw new Error(options.failWith);
      calls.signed.push(xdr);
      return { signedXdr: `signed:${xdr}` };
    },
  };
  return { client, calls };
}
