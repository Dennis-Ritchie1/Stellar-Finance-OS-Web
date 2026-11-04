import { Alert, AlertDescription } from '@finance-os/ui';
import { AlertCircle } from 'lucide-react';

/** Shows a server error message from a failed mutation, if any. */
export function FormError({ error }: { error: unknown }) {
  if (!error) return null;
  const message =
    error instanceof Error ? error.message : 'Something went wrong. Please try again.';
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
