import { describe, expect, it } from 'vitest';
import { explorerUrl, truncateAddress } from './address';

const G = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ';

describe('address', () => {
  it('truncates', () => {
    expect(truncateAddress(G)).toBe('GABC…WXYZ');
  });

  it('builds explorer urls', () => {
    expect(explorerUrl('https://stellar.expert/explorer/testnet/', 'account', 'GA')).toBe(
      'https://stellar.expert/explorer/testnet/account/GA',
    );
  });
});
