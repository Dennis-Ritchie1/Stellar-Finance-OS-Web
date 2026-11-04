export * from './network';
export { createWalletClient, type WalletClient } from './kit';
// Payment building pulls in stellar-sdk; import it from '@finance-os/wallet/payment' (lazily).
export type { InvoicePayment } from './payment';
export { describeWalletError } from './errors';
export { WalletProvider, type WalletProviderProps } from './wallet-provider';
export { useWallet, WalletCheckError, type WalletState } from './wallet-context';
