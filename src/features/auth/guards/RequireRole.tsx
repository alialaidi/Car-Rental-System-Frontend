import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Role } from '../model/session';
import { LoadingState } from '../../../shared/ui';
import { useAuth } from '../useAuth';

export interface RequireRoleProps {
  roles: Role[];
  children?: ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <LoadingState label="Checking permissions" />;
  if (status === 'anonymous') {
    return (
      <Navigate replace to="/login" state={{ returnTo: location.pathname + location.search }} />
    );
  }
  if (!user?.roles.some((role) => roles.includes(role))) {
    return <Navigate replace to="/403" state={{ from: location.pathname }} />;
  }
  return children ?? <Outlet />;
}
