import type { Role } from '../features/auth/model/session';

export interface NavItem {
  label: string;
  path: string;
  roles: Role[];
}

export const navigationItems: NavItem[] = [
  { label: 'Vehicle catalog', path: '/vehicles', roles: ['Customer'] },
  { label: 'My reservations', path: '/reservations', roles: ['Customer'] },
  { label: 'My rentals', path: '/rentals', roles: ['Customer'] },
  { label: 'My payments', path: '/payments', roles: ['Customer'] },
  {
    label: 'Reservation review',
    path: '/staff/reservations',
    roles: ['Admin', 'BranchManager', 'Employee'],
  },
  {
    label: 'Rental contracts',
    path: '/staff/contracts',
    roles: ['Admin', 'BranchManager', 'Employee'],
  },
  {
    label: 'Payments',
    path: '/staff/payments',
    roles: ['Admin', 'BranchManager', 'Employee'],
  },
  {
    label: 'Maintenance',
    path: '/staff/maintenance',
    roles: ['Admin', 'BranchManager', 'Employee'],
  },
  {
    label: 'Fleet management',
    path: '/admin/fleet',
    roles: ['Admin', 'BranchManager'],
  },
  {
    label: 'Branches and employees',
    path: '/admin/users',
    roles: ['Admin', 'BranchManager'],
  },
  {
    label: 'Reports',
    path: '/reports',
    roles: ['Admin', 'BranchManager'],
  },
];

export function navFor(roles: readonly Role[]): NavItem[] {
  const assignedRoles = new Set(roles);
  return navigationItems.filter((item) => item.roles.some((role) => assignedRoles.has(role)));
}
