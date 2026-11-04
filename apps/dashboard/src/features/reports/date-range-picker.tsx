import { Button, Input, Label } from '@finance-os/ui';
import { lastDays } from './date-range';

const PRESETS = [
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
  { label: '12 months', days: 365 },
];

/** Date range control: presets plus explicit from/to, in one row. */
export function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-3">
      <div role="group" aria-label="Quick ranges" className="flex gap-1.5">
        {PRESETS.map((p) => {
          const range = lastDays(p.days);
          const active = range.from === from && range.to === to;
          return (
            <Button
              key={p.label}
              size="sm"
              variant={active ? 'default' : 'outline'}
              aria-pressed={active}
              onClick={() => onChange(range)}
            >
              {p.label}
            </Button>
          );
        })}
      </div>
      <div className="grid gap-1">
        <Label htmlFor="range-from">From</Label>
        <Input
          id="range-from"
          type="date"
          value={from}
          max={to}
          onChange={(e) => onChange({ from: e.target.value, to })}
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="range-to">To</Label>
        <Input
          id="range-to"
          type="date"
          value={to}
          min={from}
          onChange={(e) => onChange({ from, to: e.target.value })}
        />
      </div>
    </div>
  );
}
