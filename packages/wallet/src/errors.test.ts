import { describe, expect, it } from 'vitest';
import { describeWalletError } from './errors';

describe('describeWalletError', () => {
  it('explains a user rejection plainly', () => {
    expect(describeWalletError({ code: -4, message: 'User declined access' })).toMatch(/cancelled/);
  });

  it('explains a missing wallet', () => {
    expect(describeWalletError(new Error('Freighter is not installed'))).toMatch(/installed/);
  });

  it('falls back to the original message', () => {
    expect(describeWalletError(new Error('Weird failure'))).toBe('Weird failure');
  });
});
