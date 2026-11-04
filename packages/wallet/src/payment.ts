// Client-side payment building for the public pay page (payer → invoice).
// Outgoing treasury payments are built by the backend instead — see README §5.
import {
  Account,
  Asset,
  Horizon,
  Memo,
  Operation,
  StrKey,
  TransactionBuilder,
  type Transaction,
} from '@stellar/stellar-sdk';
import { NETWORK_PASSPHRASES, type StellarNetwork } from './network';

export interface InvoicePayment {
  /** Payer's G-address (from the connected wallet). */
  source: string;
  /** Invoice's muxed M-address, or the treasury G-address (then memo is required). */
  destination: string;
  amount: string;
  assetCode: string;
  /** Omit for native XLM. */
  assetIssuer?: string;
  memo?: { type: 'text' | 'id' | 'hash'; value: string };
}

function toMemo(memo: InvoicePayment['memo']) {
  if (!memo) return Memo.none();
  if (memo.type === 'id') return Memo.id(memo.value);
  if (memo.type === 'hash') return Memo.hash(memo.value);
  return Memo.text(memo.value);
}

/** Pure builder: given the payer's current sequence, produce an unsigned transaction. */
export function buildPaymentTransaction(
  payment: InvoicePayment,
  sequence: string,
  network: StellarNetwork,
  fee = '1000',
): Transaction {
  const asset =
    payment.assetCode === 'XLM' && !payment.assetIssuer
      ? Asset.native()
      : new Asset(payment.assetCode, payment.assetIssuer);
  // Muxed destinations identify the invoice themselves; a memo would be redundant.
  const muxed = StrKey.isValidMed25519PublicKey(payment.destination);
  return new TransactionBuilder(new Account(payment.source, sequence), {
    fee,
    networkPassphrase: NETWORK_PASSPHRASES[network],
  })
    .addOperation(
      Operation.payment({ destination: payment.destination, asset, amount: payment.amount }),
    )
    .addMemo(muxed ? Memo.none() : toMemo(payment.memo))
    .setTimeout(300)
    .build();
}

export class PaymentError extends Error {
  constructor(
    message: string,
    readonly reason: 'account_not_found' | 'no_trustline' | 'underfunded' | 'submit_failed',
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export function createHorizon(horizonUrl: string) {
  const server = new Horizon.Server(horizonUrl);

  return {
    /** Load the payer's sequence number and build an unsigned XDR. */
    async buildPaymentXdr(payment: InvoicePayment, network: StellarNetwork): Promise<string> {
      let account: Horizon.AccountResponse;
      try {
        account = await server.loadAccount(payment.source);
      } catch {
        throw new PaymentError(
          "This wallet's account isn't active on the network yet. Fund it first, then try again.",
          'account_not_found',
        );
      }
      if (payment.assetCode !== 'XLM') {
        const holds = account.balances.some(
          (b) =>
            'asset_code' in b &&
            b.asset_code === payment.assetCode &&
            b.asset_issuer === payment.assetIssuer,
        );
        if (!holds) {
          throw new PaymentError(`This wallet doesn't hold ${payment.assetCode}.`, 'no_trustline');
        }
      }
      return buildPaymentTransaction(payment, account.sequenceNumber(), network).toXDR();
    },

    /** Submit a signed XDR. Returns the transaction hash. */
    async submit(signedXdr: string, network: StellarNetwork): Promise<string> {
      const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASES[network]);
      try {
        const result = await server.submitTransaction(tx);
        return result.hash;
      } catch (e) {
        const codes = (
          e as { response?: { data?: { extras?: { result_codes?: { operations?: string[] } } } } }
        ).response?.data?.extras?.result_codes?.operations;
        if (codes?.includes('op_underfunded')) {
          throw new PaymentError(
            "This wallet doesn't have enough funds for this payment.",
            'underfunded',
          );
        }
        throw new PaymentError(
          'The network rejected the payment. Please try again.',
          'submit_failed',
        );
      }
    },
  };
}
