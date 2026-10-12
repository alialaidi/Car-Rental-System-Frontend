import { lazy, Suspense } from 'react';
import { RequireRole } from '../auth/guards/RequireRole';
import { LoadingState } from '../../shared/ui';
import type { Role } from '../auth/model/session';

const VehicleCatalogPage = lazy(() =>
  import('./pages/VehicleCatalogPage').then((module) => ({ default: module.VehicleCatalogPage })),
);
const VehicleDetailsPage = lazy(() =>
  import('./pages/VehicleDetailsPage').then((module) => ({ default: module.VehicleDetailsPage })),
);
const roles: Role[] = ['Admin', 'BranchManager', 'Employee', 'Customer'];
const load = (page: React.ReactNode) => (
  <RequireRole roles={roles}>
    <Suspense fallback={<LoadingState label="Loading vehicle catalog" />}>{page}</Suspense>
  </RequireRole>
);

export const catalogRoutes = [
  { path: '/vehicles', element: load(<VehicleCatalogPage />) },
  { path: '/vehicles/:vehicleId', element: load(<VehicleDetailsPage />) },
];
