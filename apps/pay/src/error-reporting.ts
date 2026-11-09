import { setErrorReporter } from '@finance-os/utils';

declare const __SENTRY_ENABLED__: boolean;

/** No-op unless VITE_SENTRY_DSN was set at build time; otherwise the adapter is code-split out. */
export async function initErrorReporting() {
  if (!__SENTRY_ENABLED__) return;
  const { createSentryReporter } = await import('@finance-os/utils/sentry');
  setErrorReporter(createSentryReporter(import.meta.env.VITE_SENTRY_DSN!, import.meta.env.MODE));
}
