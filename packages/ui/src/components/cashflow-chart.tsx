import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatAmount, formatDecimal } from '@finance-os/utils';
import { ChartTable } from './chart-table';
import { ChartTooltipCard } from './chart-tooltip';

export interface CashflowPoint {
  date: string;
  inflow: string;
  outflow: string;
}

const SERIES = [
  { key: 'inflow', label: 'Money in', color: 'var(--chart-1)' },
  { key: 'outflow', label: 'Money out', color: 'var(--chart-2)' },
] as const;

const shortDate = (d: string) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(`${d}T00:00:00`),
  );

/**
 * Daily money in vs money out. Amounts stay strings everywhere except the bar geometry,
 * which needs numbers (display only — never used for money math).
 */
export function CashflowChart({
  data,
  assetCode,
  height = 260,
}: {
  data: CashflowPoint[];
  assetCode: string;
  height?: number;
}) {
  const plotted = data.map((p) => ({
    ...p,
    inflowN: Number(p.inflow),
    outflowN: Number(p.outflow),
  }));

  return (
    <figure aria-label={`Money in and out per day, ${assetCode}`}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={plotted}
            barGap={2}
            barCategoryGap="20%"
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v: number) => formatDecimal(String(v), { decimals: 0 })}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)', paddingBottom: 8 }}
            />
            <Tooltip
              cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <ChartTooltipCard
                    title={shortDate(String(label))}
                    assetCode={assetCode}
                    rows={SERIES.map((s) => ({
                      label: s.label,
                      color: s.color,
                      value: (payload[0]!.payload as CashflowPoint)[s.key],
                    }))}
                  />
                ) : null
              }
            />
            {SERIES.map((s) => (
              <Bar
                key={s.key}
                dataKey={`${s.key}N`}
                name={s.label}
                fill={s.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={14}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartTable
        caption={`Money in and out per day (${assetCode})`}
        columns={['Date', 'Money in', 'Money out']}
        rows={data.map((p) => [
          shortDate(p.date),
          formatAmount(p.inflow, assetCode),
          formatAmount(p.outflow, assetCode),
        ])}
      />
    </figure>
  );
}
