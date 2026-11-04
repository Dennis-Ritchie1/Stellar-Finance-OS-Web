/** Turn wallet-kit / extension errors into plain language for non-crypto users. */
export function describeWalletError(error: unknown): string {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message: unknown }).message)
      : String(error ?? '');
  const lower = message.toLowerCase();
  if (/(declin|reject|cancel|denied|closed)/.test(lower)) {
    return 'You cancelled the request in your wallet. Nothing was signed.';
  }
  if (/(not installed|not available|no wallet|unsupported)/.test(lower)) {
    return "We couldn't find that wallet. Make sure it's installed and unlocked.";
  }
  if (/(locked|unlock)/.test(lower)) return 'Unlock your wallet and try again.';
  return message || 'Something went wrong with your wallet. Please try again.';
}
