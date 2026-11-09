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

export type PaymentErrorReason =
  | 'account_not_found'
  | 'no_trustline'
  | 'submit_failed'
  | 'tx_bad_seq'
  | 'tx_insufficient_fee'
  | 'tx_too_late'
  | 'op_no_trust'
  | 'op_line_full'
  | 'op_no_destination'
  | 'op_underfunded'
  | 'timeout_unknown';

export class PaymentError extends Error {
  constructor(
    message: string,
    readonly reason: PaymentErrorReason,
    /** Set when the transaction may still have landed — never invite a second payment. */
    readonly hash?: string,
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

/** Plain-language messages for Horizon result codes. "Nothing was charged" only where true. */
const RESULT_CODE_MESSAGES: Record<
  Exclude<PaymentErrorReason, 'account_not_found' | 'no_trustline' | 'submit_failed'>,
  string
> = {
  tx_bad_seq:
    'Your wallet sent another transaction at the same moment, so this payment was refused. Nothing was charged. Start the payment again.',
  tx_insufficient_fee:
    'The network is busy and the fee was too low, so the payment was refused. Nothing was charged. Start again to use an updated fee.',
  tx_too_late:
    'The payment took too long to approve and expired. Nothing was charged. Start again and approve it promptly.',
  op_no_trust:
    "The business's account isn't set up to receive this currency yet. Nothing was charged. Please contact the business.",
  op_line_full:
    "The business's account has reached its limit for this currency and can't accept more right now. Nothing was charged. Please contact the business.",
  op_no_destination:
    "The business's payment address isn't active on the network yet. Nothing was charged. Please contact the business.",
  op_underfunded: "This wallet doesn't have enough funds for this payment.",
  timeout_unknown:
    "We couldn't confirm whether your payment went through. Don't pay again yet: check your wallet's history, or contact the business with the transaction link.",
};

const MAPPED_CODES = Object.keys(RESULT_CODE_MESSAGES) as (keyof typeof RESULT_CODE_MESSAGES)[];

interface HorizonErrorShape {
  response?: {
    status?: number;
    data?: { extras?: { result_codes?: { transaction?: string; operations?: string[] } } };
  };
}

/** Map a Horizon rejection (HTTP 400 with result codes) to a PaymentError. */
export function mapResultCodes(error: unknown): PaymentError {
  const codes = (error as HorizonErrorShape).response?.data?.extras?.result_codes;
  const all = [codes?.transaction, ...(codes?.operations ?? [])];
  const code = MAPPED_CODES.find((c) => c !== 'timeout_unknown' && all.includes(c));
  if (code) return new PaymentError(RESULT_CODE_MESSAGES[code], code);
  return new PaymentError(
    'The network rejected the payment. Nothing was charged. Please try again.',
    'submit_failed',
  );
}

/**
 * True when Horizon did not give a definitive answer: a 5xx (e.g. 504 timeout) or no response at
 * all (network drop after send). The transaction may still land in the ledger.
 */
export function isIndeterminate(error: unknown): boolean {
  const response = (error as HorizonErrorShape).response;
  if (!response) return true;
  if (response.data?.extras?.result_codes) return false;
  return (response.status ?? 0) >= 500;
}

/** Bounds for the dynamic fee, in stroops (1 XLM = 10,000,000 stroops). */
export const BASE_FEE_STROOPS = 100;
export const DEFAULT_FEE_STROOPS = 1000;
export const MAX_FEE_STROOPS = 100_000;

/** Clamp a fee_stats percentile to [base fee, cap]; fall back to the default if unparseable. */
export function clampFee(p70: string | undefined): string {
  const n = Number.parseInt(p70 ?? '', 10);
  if (!Number.isFinite(n)) return String(DEFAULT_FEE_STROOPS);
  return String(Math.min(Math.max(n, BASE_FEE_STROOPS), MAX_FEE_STROOPS));
}

export interface HorizonOptions {
  /** Delay between "did it land?" lookups after a timeout. */
  pollMs?: number;
  /** Extra seconds to keep checking after the transaction's max time, for ledger close lag. */
  graceSeconds?: number;
  /** Clock in ms; injectable for tests. */
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

export interface BuiltPayment {
  xdr: string;
  /** Fee in stroops that the transaction commits to pay at most. */
  feeStroops: string;
}

/** Hex transaction hash, computed locally from the signed envelope. */
export function txHashHex(tx: Transaction): string {
  return Array.from(tx.hash(), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function createHorizon(horizonUrl: string, options: HorizonOptions = {}) {
  const server = new Horizon.Server(horizonUrl);
  const {
    pollMs = 3000,
    graceSeconds = 10,
    now = () => Date.now(),
    sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms)),
  } = options;

  async function currentFee(): Promise<string> {
    try {
      const stats = await server.feeStats();
      return clampFee(stats.fee_charged.p70);
    } catch {
      return String(DEFAULT_FEE_STROOPS);
    }
  }

  /** Look the transaction up by hash until it appears or can no longer be included. */
  async function resolveUnknown(tx: Transaction, hash: string): Promise<string> {
    const maxTime = Number(tx.timeBounds?.maxTime ?? 0);
    const deadlineMs = maxTime > 0 ? (maxTime + graceSeconds) * 1000 : now() + 60_000;
    let lastLookupNotFound: boolean | undefined;
    for (;;) {
      try {
        const found = await server.transactions().transaction(hash).call();
        if (found.successful === false) {
          throw new PaymentError(
            'The network received the payment but it did not go through. Please try again.',
            'submit_failed',
          );
        }
        return hash;
      } catch (e) {
        if (e instanceof PaymentError) throw e;
        lastLookupNotFound = (e as HorizonErrorShape).response?.status === 404;
        // Any other error means Horizon was unreachable — keep trying until the deadline.
      }
      if (now() >= deadlineMs) break;
      await sleep(pollMs);
    }
    if (lastLookupNotFound) {
      // Horizon answered "not found" and the transaction can no longer be included.
      throw new PaymentError(RESULT_CODE_MESSAGES.tx_too_late, 'tx_too_late');
    }
    throw new PaymentError(RESULT_CODE_MESSAGES.timeout_unknown, 'timeout_unknown', hash);
  }

  return {
    /** Load the payer's sequence number and build an unsigned XDR with a fee for current load. */
    async buildPaymentXdr(payment: InvoicePayment, network: StellarNetwork): Promise<BuiltPayment> {
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
      const feeStroops = await currentFee();
      const tx = buildPaymentTransaction(payment, account.sequenceNumber(), network, feeStroops);
      return { xdr: tx.toXDR(), feeStroops };
    },

    /**
     * Submit a signed XDR. Returns the transaction hash.
     * On a timeout / dropped connection the transaction may still land, so we compute its hash
     * locally and look it up (calling `onChecking` first) instead of reporting a failure.
     */
    async submit(
      signedXdr: string,
      network: StellarNetwork,
      onChecking?: () => void,
    ): Promise<string> {
      const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASES[network]) as Transaction;
      const hash = txHashHex(tx);
      try {
        const result = await server.submitTransaction(tx);
        return result.hash;
      } catch (e) {
        if (!isIndeterminate(e)) throw mapResultCodes(e);
        onChecking?.();
        return resolveUnknown(tx, hash);
      }
    },
  };
}
