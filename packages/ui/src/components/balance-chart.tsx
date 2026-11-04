import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatAmount, formatDecimal } from '@finance-os/utils';
import { ChartTable } from './chart-table';
import { ChartTooltipCard } from './chart-tooltip';

export interface BalancePoint {
  date: string;
  balance: string;
}

const shortDate = (d: string) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(`${d}T00:00:00`),
  );

/** Single-series end-of-day balance (no legend — the title names it). */
export function BalanceChart({
  data,
  assetCode,
  height = 220,
}: {
  data: BalancePoint[];
  assetCode: string;
  height?: number;
}) {
  const plotted = data.map((p) => ({ ...p, balanceN: Number(p.balance) }));

  return (
    <figure aria-label={`End-of-day balance, ${assetCode}`}>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={plotted} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
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
              width={64}
              domain={['auto', 'auto']}
              tickFormatter={(v: number) => formatDecimal(String(v), { decimals: 0 })}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '3 3' }}
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <ChartTooltipCard
                    title={shortDate(String(label))}
                    assetCode={assetCode}
                    rows={[
                      {
                        label: 'Balance',
                        color: 'var(--chart-1)',
                        value: (payload[0]!.payload as BalancePoint).balance,
                      },
                    ]}
                  />
                ) : null
              }
            />
            <Line
              type="monotone"
              dataKey="balanceN"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: 'var(--card)', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartTable
        caption={`End-of-day balance (${assetCode})`}
        columns={['Date', 'Balance']}
        rows={data.map((p) => [shortDate(p.date), formatAmount(p.balance, assetCode)])}
      />
    </figure>
  );
}
