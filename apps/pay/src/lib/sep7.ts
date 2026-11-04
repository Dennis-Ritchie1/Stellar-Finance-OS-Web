// SEP-7 payment URI: https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0007.md
// We encode the G-address + memo form, which more wallets support than muxed (M-) addresses.
// ⚠️ Wallet support for SEP-7 QR codes varies — test with the wallets pilot clients actually use.

export type Sep7MemoType = 'MEMO_TEXT' | 'MEMO_ID' | 'MEMO_HASH' | 'MEMO_RETURN';

export interface Sep7PayParams {
  destination: string;
  amount: string;
  assetCode: string;
  /** Omit for native XLM. */
  assetIssuer?: string;
  memo?: string;
  memoType?: Sep7MemoType;
  networkPassphrase?: string;
}

export function buildSep7PayUri(p: Sep7PayParams): string {
  const params = new URLSearchParams({ destination: p.destination, amount: p.amount });
  if (p.assetCode !== 'XLM') {
    params.set('asset_code', p.assetCode);
    if (p.assetIssuer) params.set('asset_issuer', p.assetIssuer);
  }
  if (p.memo) {
    params.set('memo', p.memo);
    params.set('memo_type', p.memoType ?? 'MEMO_TEXT');
  }
  if (p.networkPassphrase) params.set('network_passphrase', p.networkPassphrase);
  return `web+stellar:pay?${params.toString()}`;
}
