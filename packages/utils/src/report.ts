/**
 * Error reporting seam. The default reporter is a no-op: nothing leaves the browser unless an app
 * installs an adapter (see `./sentry`, enabled by VITE_SENTRY_DSN). Everything passed to a reporter
 * is scrubbed first, so adapters never see tokens, org IDs, Stellar addresses or amounts.
 */

export type ErrorContext = Record<string, unknown>;

export interface ErrorReport {
  name: string;
  message: string;
  stack?: string;
  context: ErrorContext;
}

export type ErrorReporter = (report: ErrorReport) => void;

const REDACTED = '[redacted]';
const MAX_DEPTH = 6;

/** Keys whose values are never sent, whatever they contain. */
const SENSITIVE_KEY =
  /token|authori[sz]ation|cookie|secret|password|org[-_]?id|address|account|amount|balance|memo|destination|source|public[-_]?key|signature|xdr|email|price|total|subtotal/i;

const STRING_RULES: Array<[RegExp, string]> = [
  [/Bearer\s+[\w.~+/=-]+/gi, 'Bearer [redacted]'],
  [/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, '[jwt]'],
  [/\b[GMC][A-Z2-7]{55,68}\b/g, '[address]'],
  [/\borg_[\w-]+/gi, '[org]'],
  [/\/i\/[^/?#\s'")]+/g, '/i/[redacted]'],
  [/\b\d[\d,]*(?:\.\d+)?\s?(?:XLM|USDC|EURC|USD|EUR|GBP|NGN)\b/g, '[amount]'],
  [/\b\d+\.\d{2,}\b/g, '[amount]'],
];

export function scrubString(value: string): string {
  return STRING_RULES.reduce((out, [re, repl]) => out.replace(re, repl), value);
}

export function scrubValue(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (typeof value === 'string') return scrubString(value);
  if (value === null || typeof value !== 'object') {
    return typeof value === 'function' || typeof value === 'symbol' ? undefined : value;
  }
  if (depth >= MAX_DEPTH || seen.has(value)) return '[truncated]';
  seen.add(value);
  if (value instanceof Error) return scrubString(`${value.name}: ${value.message}`);
  if (Array.isArray(value)) return value.map((v) => scrubValue(v, depth + 1, seen));
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [
      k,
      SENSITIVE_KEY.test(k) ? REDACTED : scrubValue(v, depth + 1, seen),
    ]),
  );
}

export function scrubContext(context: ErrorContext = {}): ErrorContext {
  return scrubValue(context) as ErrorContext;
}

export function toErrorReport(error: unknown, context?: ErrorContext): ErrorReport {
  const err = error instanceof Error ? error : new Error(String(error));
  return {
    name: err.name,
    message: scrubString(err.message),
    stack: err.stack ? scrubString(err.stack) : undefined,
    context: scrubContext(context),
  };
}

let reporter: ErrorReporter = () => {};

/** Install a reporter adapter. Pass nothing to restore the no-op default. */
export function setErrorReporter(next?: ErrorReporter) {
  reporter = next ?? (() => {});
}

/** Report an error with context. Safe to call anywhere; never throws. */
export function reportError(error: unknown, context?: ErrorContext): void {
  try {
    reporter(toErrorReport(error, context));
  } catch {
    // Reporting must never cause a second failure.
  }
}

/** Short, quotable ID shown to users and attached to the report so support can find it. */
export function createReferenceId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}
