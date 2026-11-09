import { getErrorMessage } from '@finance-os/api-client';
import { Alert, AlertDescription } from '@finance-os/ui';
import { AlertCircle } from 'lucide-react';

/** Shows a plain-language message for a failed mutation, if any. */
export function FormError({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertDescription>{getErrorMessage(error)}</AlertDescription>
    </Alert>
  );
}
