import { PlannedScreen } from '../components/planned-screen';

export function VendorsPage() {
  return (
    <PlannedScreen
      title="Vendors"
      description="Vendor records, payout addresses and required memos."
      task={7}
    />
  );
}
