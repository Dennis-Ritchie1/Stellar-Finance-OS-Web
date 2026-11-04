import { EmptyState, PageHeader } from '@finance-os/ui';
import { Construction } from 'lucide-react';

/** Placeholder for screens that later build-order tasks will fill in. */
export function PlannedScreen({
  title,
  description,
  task,
}: {
  title: string;
  description: string;
  task: number;
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={<Construction />}
        title="Not built yet"
        description={`This screen is planned for build-order task #${task}. See README.md §9.`}
      />
    </>
  );
}
