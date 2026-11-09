import { describe, expect, it } from 'vitest';
import { ApiError } from './errors';
import { getErrorMessage, NETWORK_ERROR_MESSAGE } from './error-messages';

describe('getErrorMessage', () => {
  it('turns network failures into plain language', () => {
    expect(getErrorMessage(new TypeError('Failed to fetch'))).toBe(NETWORK_ERROR_MESSAGE);
  });
  it('maps known codes and falls back to the server message', () => {
    expect(getErrorMessage(new ApiError(409, { code: 'paid', message: 'raw' }))).toBe(
      'This invoice has already been paid.',
    );
    expect(getErrorMessage(new ApiError(400, { code: 'weird', message: 'Server says no' }))).toBe(
      'Server says no',
    );
  });
});
