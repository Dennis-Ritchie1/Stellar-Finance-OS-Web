import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { createWalletClient, type WalletClient } from './kit';
import { checkSigner, type StellarNetwork } from './network';
import { WalletCheckError, WalletContext, type WalletState } from './wallet-context';

export interface WalletProviderProps {
  network: StellarNetwork;
  /** Inject a client in tests; defaults to Stellar Wallets Kit. */
  client?: WalletClient;
  children: ReactNode;
}

export function WalletProvider({ network, client, children }: WalletProviderProps) {
  const [wallet] = useState(() => client ?? createWalletClient(network));
  const [address, setAddress] = useState<string | null>(null);
  // Read through a ref so a sign() call right after connect() (same tick) sees the new address.
  const addressRef = useRef<string | null>(null);
  const [status, setStatus] = useState<WalletState['status']>('disconnected');

  const connect = useCallback(async () => {
    setStatus('connecting');
    try {
      const { address: connected } = await wallet.connect();
      addressRef.current = connected;
      setAddress(connected);
      setStatus('connected');
      return connected;
    } catch (e) {
      setStatus(addressRef.current ? 'connected' : 'disconnected');
      throw e;
    }
  }, [wallet]);

  const disconnect = useCallback(async () => {
    await wallet.disconnect();
    addressRef.current = null;
    setAddress(null);
    setStatus('disconnected');
  }, [wallet]);

  const signTransaction = useCallback<WalletState['signTransaction']>(
    async (xdr, options = {}) => {
      const address = addressRef.current;
      if (!address) throw new WalletCheckError('Connect your wallet first.', 'not-connected');
      const networkCheck = await wallet.checkNetwork();
      if (!networkCheck.ok) throw new WalletCheckError(networkCheck.message, 'network-mismatch');
      if (options.expectedSigner) {
        const signerCheck = checkSigner(options.expectedSigner, address);
        if (!signerCheck.ok) throw new WalletCheckError(signerCheck.message, 'wrong-account');
      }
      const { signedXdr } = await wallet.signTransaction(xdr, { address });
      return signedXdr;
    },
    [wallet],
  );

  const value = useMemo<WalletState>(
    () => ({ network, address, status, connect, disconnect, signTransaction }),
    [network, address, status, connect, disconnect, signTransaction],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
