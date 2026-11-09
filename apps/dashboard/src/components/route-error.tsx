import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useRouteError } from 'react-router';
import { RouteErrorBoundary } from '@finance-os/ui';
import { createReferenceId, reportError } from '@finance-os/utils';

/** `errorElement` for dashboard routes: renders inside the app shell and reports the error once. */
export function RouteError() {
  const error = useRouteError();
  const location = useLocation();
  const navigate = useNavigate();
  const [referenceId] = useState(createReferenceId);
  const reported = useRef<unknown>(null);

  useEffect(() => {
    if (reported.current === error) return;
    reported.current = error;
    reportError(error, { referenceId, app: 'dashboard', route: location.pathname });
  }, [error, referenceId, location.pathname]);

  return (
    <RouteErrorBoundary
      referenceId={referenceId}
      onRetry={() => void navigate(`${location.pathname}${location.search}`, { replace: true })}
      onGoHome={() => void navigate('/')}
    />
  );
}
