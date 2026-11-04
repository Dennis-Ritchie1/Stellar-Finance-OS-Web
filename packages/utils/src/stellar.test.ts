import { describe, expect, it } from 'vitest';
import { isMuxedAddress, isStellarAccountId, isValidMemo } from './stellar';

describe('stellar format checks', () => {
  it('recognises G and M addresses', () => {
    expect(isStellarAccountId('GCHWRJPTFFVZWRMP2F5ZR5S7M6IXUDXCL4EMXHTWV2V3MJK4GJHZHHXS')).toBe(
      true,
    );
    expect(isStellarAccountId('not-an-address')).toBe(false);
    expect(
      isMuxedAddress('MCHWRJPTFFVZWRMP2F5ZR5S7M6IXUDXCL4EMXHTWV2V3MJK4GJHZGAAAAAAAAAAD5GZJO'),
    ).toBe(true);
  });

  it('enforces memo limits', () => {
    expect(isValidMemo('a'.repeat(28), 'text')).toBe(true);
    expect(isValidMemo('a'.repeat(29), 'text')).toBe(false);
    expect(isValidMemo('12345', 'id')).toBe(true);
    expect(isValidMemo('12a', 'id')).toBe(false);
  });
});
