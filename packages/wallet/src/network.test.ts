import { describe, expect, it } from 'vitest';
import { checkNetwork, checkSigner, NETWORK_PASSPHRASES, parseNetwork } from './network';

describe('network checks', () => {
  it('parses env values', () => {
    expect(parseNetwork('testnet')).toBe('testnet');
    expect(() => parseNetwork('nope')).toThrow();
  });

  it('blocks a mainnet wallet on a testnet app', () => {
    const result = checkNetwork('testnet', NETWORK_PASSPHRASES.mainnet);
    expect(result).toMatchObject({ ok: false, reason: 'network-mismatch' });
  });

  it('passes when networks match', () => {
    expect(checkNetwork('testnet', NETWORK_PASSPHRASES.testnet)).toEqual({ ok: true });
  });

  it('explains which account to switch to', () => {
    expect(checkSigner('GTREASURY', 'GOTHER')).toMatchObject({
      ok: false,
      reason: 'wrong-account',
      expectedAddress: 'GTREASURY',
    });
  });
});
