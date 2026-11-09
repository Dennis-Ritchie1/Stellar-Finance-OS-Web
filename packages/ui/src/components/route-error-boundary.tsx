import { AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { EmptyState } from './empty-state';

export interface RouteErrorBoundaryProps {
  /** Short ID the user can quote to support; also attached to the error report. */
  referenceId: string;
  onRetry: () => void;
  onGoHome: () => void;
  title?: string;
  description?: string;
  retryLabel?: string;
  homeLabel?: string;
}

/** Calm, plain-language fallback shown when a route throws while rendering. */
export function RouteErrorBoundary({
  referenceId,
  onRetry,
  onGoHome,
  title = 'Something went wrong on this page',
  description = 'The rest of the app is still working. You can try again or head back.',
  retryLabel = 'Try again',
  homeLabel = 'Go to dashboard',
}: RouteErrorBoundaryProps) {
  return (
    <div role="alert">
      <EmptyState
        icon={<AlertTriangle />}
        title={title}
        description={description}
        action={
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={onRetry}>{retryLabel}</Button>
              <Button variant="outline" onClick={onGoHome}>
                {homeLabel}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Reference: <span className="font-mono">{referenceId}</span>
            </p>
          </div>
        }
      />
    </div>
  );
}
