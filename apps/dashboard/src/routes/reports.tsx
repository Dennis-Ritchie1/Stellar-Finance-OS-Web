import { useSearchParams } from 'react-router';
import { useTreasuryReport } from '@finance-os/api-client';
import {
  Amount,
  BalanceChart,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CashflowChart,
  EmptyState,
  PageHeader,
} from '@finance-os/ui';
import { CalendarRange } from 'lucide-react';
import { QueryView } from '../components/query-view';
import { StatTile } from '../features/dashboard/stat-tile';
import { isValidRange, lastDays } from '../features/reports/date-range';
import { DateRangePicker } from '../features/reports/date-range-picker';

export function ReportsPage() {
  const [params, setParams] = useSearchParams();
  const fallback = lastDays(30);
  const from = params.get('from') ?? fallback.from;
  const to = params.get('to') ?? fallback.to;
  const valid = isValidRange(from, to);
  const query = useTreasuryReport(valid ? from : '', valid ? to : '');

  return (
    <>
      <PageHeader title="Reports" description="Treasury inflows, outflows and balance over time." />
      <DateRangePicker from={from} to={to} onChange={(r) => setParams(r, { replace: true })} />
      {!valid ? (
        <EmptyState
          icon={<CalendarRange />}
          title="Choose a valid date range"
          description="The start date must be on or before the end date."
        />
      ) : (
        <QueryView query={query} resource="this report">
          {(report) => (
            <div className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile
                  label="Opening balance"
                  value={<Amount value={report.openingBalance} assetCode={report.assetCode} />}
                />
                <StatTile
                  label="Money in"
                  value={<Amount value={report.totalInflow} assetCode={report.assetCode} />}
                />
                <StatTile
                  label="Money out"
                  value={<Amount value={report.totalOutflow} assetCode={report.assetCode} />}
                />
                <StatTile
                  label="Closing balance"
                  value={<Amount value={report.closingBalance} assetCode={report.assetCode} />}
                />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Money in and out</CardTitle>
                  <CardDescription>Daily totals for the selected range.</CardDescription>
                </CardHeader>
                <CardContent>
                  <CashflowChart data={report.series} assetCode={report.assetCode} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Balance</CardTitle>
                  <CardDescription>End-of-day treasury balance.</CardDescription>
                </CardHeader>
                <CardContent>
                  <BalanceChart data={report.series} assetCode={report.assetCode} />
                </CardContent>
              </Card>
            </div>
          )}
        </QueryView>
      )}
    </>
  );
}
