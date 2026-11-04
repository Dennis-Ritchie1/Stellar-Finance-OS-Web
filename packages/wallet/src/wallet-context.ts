import { createContext, useContext } from 'react';
import type { StellarNetwork } from './network';

export class WalletCheckError extends Error {
  constructor(
    message: string,
    readonly reason: 'not-connected' | 'network-mismatch' | 'wrong-account',
  ) {
    super(message);
    this.name = 'WalletCheckError';
  }
}

export interface WalletState {
  network: StellarNetwork;
  address: string | null;
  status: 'disconnected' | 'connecting' | 'connected';
  connect: () => Promise<string>;
  disconnect: () => Promise<void>;
  /**
   * Sign an XDR after verifying the wallet's network (and, if given, that the
   * connected account is `expectedSigner`). Throws WalletCheckError if not.
   */
  signTransaction: (xdr: string, options?: { expectedSigner?: string }) => Promise<string>;
}

export const WalletContext = createContext<WalletState | null>(null);

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
}
