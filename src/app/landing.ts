import type { Role } from '../features/auth/model/session';

export function landingFor(roles: readonly Role[]): string {
  if (roles.includes('Admin')) return '/admin/fleet';
  if (roles.includes('BranchManager')) return '/staff/reservations';
  if (roles.includes('Employee')) return '/staff/reservations';
  if (roles.includes('Customer')) return '/vehicles';
  return '/login';
}
