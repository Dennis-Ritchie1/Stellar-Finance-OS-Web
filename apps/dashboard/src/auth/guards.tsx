import { Navigate, Outlet, useLocation } from 'react-router';
import { Spinner } from '@finance-os/ui';
import { useAuth } from './auth-context';

/** Redirects to /login when there's no session; remembers where the user was going. */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <Spinner className="min-h-svh" label="Loading your account" />;
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}

/** Keeps signed-in users away from /login and /register (sending them where they were headed). */
export function RedirectIfAuthenticated() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <Spinner className="min-h-svh" label="Loading your account" />;
  if (status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }
  return <Outlet />;
}
