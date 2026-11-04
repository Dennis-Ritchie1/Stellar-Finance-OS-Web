import { PlannedScreen } from '../components/planned-screen';

export function InvoiceEditorPage() {
  return (
    <PlannedScreen title="New invoice" description="Line items, asset and due date." task={5} />
  );
}
