const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar date as YYYY-MM-DD. */
export function toDateInput(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The last `days` days, ending today (inclusive). */
export function lastDays(days: number, today = new Date()) {
  const from = new Date(today);
  from.setDate(from.getDate() - (days - 1));
  return { from: toDateInput(from), to: toDateInput(today) };
}

export function isValidRange(from: string, to: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(from) && /^\d{4}-\d{2}-\d{2}$/.test(to) && from <= to;
}
