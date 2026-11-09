import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useRouteError } from 'react-router';
import { RouteErrorBoundary } from '@finance-os/ui';
import { createReferenceId, reportError } from '@finance-os/utils';

/** `errorElement` for the pay app: client-friendly copy, never a blank page or a stack trace. */
export function RouteError() {
  const error = useRouteError();
  const location = useLocation();
  const navigate = useNavigate();
  const [referenceId] = useState(createReferenceId);
  const reported = useRef<unknown>(null);

  useEffect(() => {
    if (reported.current === error) return;
    reported.current = error;
    // Pay links carry a secret token in the path, so only the route shape is reported.
    reportError(error, { referenceId, app: 'pay', route: '/i/:publicToken' });
  }, [error, referenceId]);

  return (
    <RouteErrorBoundary
      referenceId={referenceId}
      title="We couldn't show this invoice"
      description="Your payment details have not changed. Try again, or contact the sender if it keeps happening."
      homeLabel="Reload page"
      onRetry={() => void navigate(`${location.pathname}${location.search}`, { replace: true })}
      onGoHome={() => window.location.reload()}
    />
  );
}
