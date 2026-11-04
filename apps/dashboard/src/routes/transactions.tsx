import { PlannedScreen } from '../components/planned-screen';

export function TransactionsPage() {
  return (
    <PlannedScreen
      title="Transactions"
      description="All payments in and out. Match unmatched payments to invoices."
      task={9}
    />
  );
}
