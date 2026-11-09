import type { ErrorReporter } from './report';

/**
 * Minimal Sentry adapter over the public envelope endpoint (no SDK). Loaded only through a dynamic
 * import guarded by VITE_SENTRY_DSN, so it is absent from bundles when the DSN is unset.
 */
export function createSentryReporter(dsn: string, environment?: string): ErrorReporter | undefined {
  let url: URL;
  try {
    url = new URL(dsn);
  } catch {
    return undefined;
  }
  const projectId = url.pathname.replace(/^\/+/, '');
  if (!url.username || !projectId) return undefined;
  const endpoint = `${url.protocol}//${url.host}/api/${projectId}/envelope/?sentry_key=${url.username}&sentry_version=7`;

  return (report) => {
    const eventId = crypto.randomUUID().replaceAll('-', '');
    const event = {
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: 'javascript',
      level: 'error',
      environment,
      tags: { reference_id: String(report.context.referenceId ?? '') },
      extra: report.context,
      exception: {
        values: [{ type: report.name, value: report.message, stacktrace: undefined }],
      },
      message: report.stack ? `${report.name}: ${report.message}\n${report.stack}` : undefined,
    };
    const body = [
      JSON.stringify({ event_id: eventId }),
      JSON.stringify({ type: 'event' }),
      JSON.stringify(event),
    ].join('\n');
    // text/plain keeps this a "simple" request: no CORS preflight.
    void fetch(endpoint, { method: 'POST', body, keepalive: true }).catch(() => {});
  };
}
