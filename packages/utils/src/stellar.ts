// Lightweight format checks for form validation. The backend does the authoritative validation.
const G_ADDRESS = /^G[A-Z2-7]{55}$/;
const M_ADDRESS = /^M[A-Z2-7]{68}$/;

export function isStellarAccountId(value: string): boolean {
  return G_ADDRESS.test(value.trim());
}

export function isMuxedAddress(value: string): boolean {
  return M_ADDRESS.test(value.trim());
}

/** Stellar memo limits: text ≤ 28 bytes, id is a uint64. */
export function isValidMemo(value: string, type: 'text' | 'id' | 'hash'): boolean {
  if (type === 'text') return new TextEncoder().encode(value).length <= 28;
  if (type === 'id') return /^\d+$/.test(value) && BigInt(value) <= 18446744073709551615n;
  return /^[0-9a-f]{64}$/i.test(value);
}
