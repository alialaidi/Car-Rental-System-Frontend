import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../../../shared/ui';
import { useAuth } from '../useAuth';

export interface RequireAuthProps {
  children?: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState label="Checking your session" />;
  if (status === 'anonymous') {
    return (
      <Navigate
        replace
        to="/login"
        state={{ returnTo: location.pathname + location.search + location.hash }}
      />
    );
  }
  return children ?? <Outlet />;
}
