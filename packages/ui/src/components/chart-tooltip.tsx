import { formatAmount } from '@finance-os/utils';

export interface ChartTooltipRow {
  label: string;
  /** Decimal string from the API. */
  value: string;
  color: string;
}

/** Hover card: values in text ink, the colored swatch carries identity. */
export function ChartTooltipCard({
  title,
  rows,
  assetCode,
}: {
  title: string;
  rows: ChartTooltipRow[];
  assetCode: string;
}) {
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      <p className="mb-1 font-medium">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: r.color }} aria-hidden />
          <span className="text-muted-foreground">{r.label}</span>
          <span className="ml-auto pl-3 font-medium tabular-nums">
            {formatAmount(r.value, assetCode)}
          </span>
        </p>
      ))}
    </div>
  );
}
