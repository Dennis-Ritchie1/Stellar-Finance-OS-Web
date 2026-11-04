const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

/** "in 3 days", "2 hours ago". Uses the user's locale by default. */
export function formatRelative(
  date: Date | string,
  now: Date = new Date(),
  locale?: string,
): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffSeconds = Math.round((target.getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const [unit, seconds] of UNITS) {
    if (Math.abs(diffSeconds) >= seconds) {
      return rtf.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return rtf.format(0, 'minute');
}

/** Local-timezone date, e.g. "4 Nov 2026". */
export function formatDate(date: Date | string, locale?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
}

/** Whole days a due date is past `now` (0 if not overdue). */
export function daysOverdue(dueDate: Date | string, now: Date = new Date()): number {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const diff = Math.floor((now.getTime() - due.getTime()) / (24 * 3600 * 1000));
  return Math.max(0, diff);
}
