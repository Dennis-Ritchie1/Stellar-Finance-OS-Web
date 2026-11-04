import { useState } from 'react';
import { useExportReconciliation } from '@finance-os/api-client';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  PageHeader,
} from '@finance-os/ui';
import { CheckCircle2, Download, Lock } from 'lucide-react';
import { usePermission } from '../auth/use-permission';
import { FormError } from '../components/forms/form-error';
import { isValidRange, lastDays } from '../features/reports/date-range';
import { DateRangePicker } from '../features/reports/date-range-picker';
import { downloadText } from '../lib/download';

export function ExportsPage() {
  const canExport = usePermission('exports:run');
  const [range, setRange] = useState(() => lastDays(30));
  const [lastFile, setLastFile] = useState<string | null>(null);
  const exportCsv = useExportReconciliation();
  const valid = isValidRange(range.from, range.to);

  const run = () =>
    exportCsv.mutate(range, {
      onSuccess: (csv) => {
        const filename = `reconciliation_${range.from}_${range.to}.csv`;
        downloadText(filename, csv);
        setLastFile(filename);
      },
    });

  return (
    <>
      <PageHeader
        title="Exports"
        description="Download payments for reconciliation in your accounting software."
      />
      {!canExport ? (
        <EmptyState
          icon={<Lock />}
          title="You can't run exports"
          description="Ask an owner, admin or accountant for a copy."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Reconciliation CSV</CardTitle>
            <CardDescription>
              One row per payment: date, amount, counterparty, memo, the invoice or vendor payment
              it matched, and a transaction link.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
            <FormError error={exportCsv.error} />
            {lastFile ? (
              <Alert variant="success">
                <CheckCircle2 />
                <AlertDescription>Downloaded {lastFile}</AlertDescription>
              </Alert>
            ) : null}
            <div>
              <Button onClick={run} disabled={!valid || exportCsv.isPending}>
                <Download /> {exportCsv.isPending ? 'Preparing…' : 'Download CSV'}
              </Button>
              {!valid ? (
                <p className="mt-2 text-sm text-destructive">Choose a valid date range.</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
