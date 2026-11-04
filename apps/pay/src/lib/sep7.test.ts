import { describe, expect, it } from 'vitest';
import { buildSep7PayUri } from './sep7';

describe('buildSep7PayUri', () => {
  it('encodes a USDC payment with memo', () => {
    const uri = buildSep7PayUri({
      destination: 'GDEST',
      amount: '120.50',
      assetCode: 'USDC',
      assetIssuer: 'GISSUER',
      memo: 'INV 0042',
    });
    expect(uri.startsWith('web+stellar:pay?')).toBe(true);
    const q = new URLSearchParams(uri.split('?')[1]);
    expect(Object.fromEntries(q)).toEqual({
      destination: 'GDEST',
      amount: '120.50',
      asset_code: 'USDC',
      asset_issuer: 'GISSUER',
      memo: 'INV 0042',
      memo_type: 'MEMO_TEXT',
    });
  });

  it('omits asset fields for native XLM', () => {
    const uri = buildSep7PayUri({ destination: 'GDEST', amount: '1', assetCode: 'XLM' });
    expect(uri).toBe('web+stellar:pay?destination=GDEST&amount=1');
  });
});
