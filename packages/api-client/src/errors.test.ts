import { describe, expect, it } from 'vitest';
import { ApiError, isForbidden, unwrap } from './errors';

const res = (status: number) => new Response(null, { status });

describe('unwrap', () => {
  it('returns data on success', () => {
    expect(unwrap({ data: { a: 1 }, response: res(200) })).toEqual({ a: 1 });
  });

  it('throws ApiError with status and message', () => {
    try {
      unwrap({ error: { code: 'forbidden', message: 'Nope' }, response: res(403) });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).message).toBe('Nope');
      expect(isForbidden(e)).toBe(true);
    }
  });

  it('throws on non-ok responses with no body', () => {
    expect(() => unwrap({ response: res(404) })).toThrowError(/404/);
  });
});
