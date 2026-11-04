import { PlannedScreen } from '../components/planned-screen';

export function ReportsPage() {
  return (
    <PlannedScreen
      title="Reports"
      description="Inflows, outflows and balances over a date range."
      task={10}
    />
  );
}
