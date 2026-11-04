import { PlannedScreen } from '../../components/planned-screen';

export function SettingsPage() {
  return (
    <PlannedScreen
      title="Settings"
      description="Organization, members and roles, treasury accounts, approval policies."
      task={12}
    />
  );
}
