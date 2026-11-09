import { afterEach, describe, expect, it, vi } from 'vitest';
import { reportError, scrubContext, setErrorReporter } from './report';

const ADDRESS = 'GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H';

describe('error reporting scrubber', () => {
  afterEach(() => setErrorReporter());

  it('removes tokens, org IDs, addresses and amounts from payloads', () => {
    const calls = vi.fn();
    setErrorReporter(calls);
    reportError(new Error(`Failed paying ${ADDRESS} 12.50 USDC with Bearer abc.def`), {
      authorization: 'Bearer secret-token',
      headers: { 'X-Org-Id': 'org_acme' },
      invoice: { amount: '100.00', destination: ADDRESS, number: 'INV-1' },
      url: '/i/pub_1001 org_acme',
    });
    expect(calls).toHaveBeenCalledOnce();
    const out = JSON.stringify(calls.mock.calls[0]![0]);
    for (const leak of [
      ADDRESS,
      'secret-token',
      'org_acme',
      '12.50',
      '100.00',
      'abc.def',
      'pub_1001',
    ])
      expect(out).not.toContain(leak);
    expect(out).toContain('INV-1');
  });

  it('is a no-op by default and never throws', () => {
    expect(() => reportError(new Error('x'))).not.toThrow();
    setErrorReporter(() => {
      throw new Error('adapter down');
    });
    expect(() => reportError(new Error('x'))).not.toThrow();
    expect(scrubContext({ token: 't' })).toEqual({ token: '[redacted]' });
  });
});
