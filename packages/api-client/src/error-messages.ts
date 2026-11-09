import { ApiError } from './errors';

export const NETWORK_ERROR_MESSAGE = "We couldn't reach Finance OS. Check your connection.";
export const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';

/** User-facing copy for known backend `ApiError.code` values. The one place wording lives. */
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  not_draft: 'Only draft invoices can be changed.',
  paid: 'This invoice has already been paid.',
  forbidden: "You don't have permission to do that.",
  unauthorized: 'Your session has expired. Please sign in again.',
  not_found: "We couldn't find what you were looking for.",
  rate_limited: 'Too many requests. Please wait a moment and try again.',
};

/** `fetch` rejects with a TypeError (or similar) when the request never reached the server. */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) return false;
  if (error instanceof TypeError) return true;
  return (
    error instanceof Error &&
    /failed to fetch|networkerror|network request failed|load failed/i.test(error.message)
  );
}

/** Map any thrown value to plain-language copy: known code → server message → generic. */
export function getErrorMessage(error: unknown): string {
  if (isNetworkError(error)) return NETWORK_ERROR_MESSAGE;
  if (error instanceof ApiError) {
    const known = error.code ? ERROR_CODE_MESSAGES[error.code] : undefined;
    return known ?? error.message ?? GENERIC_ERROR_MESSAGE;
  }
  if (error instanceof Error && error.message) return error.message;
  return GENERIC_ERROR_MESSAGE;
}
