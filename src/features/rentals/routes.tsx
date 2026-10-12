import { lazy, Suspense } from 'react';
import { RequireRole } from '../auth/guards/RequireRole';
import type { Role } from '../auth/model/session';
import { LoadingState } from '../../shared/ui';

const MyRentalsPage = lazy(() =>
  import('./pages/MyRentalsPage').then((module) => ({ default: module.MyRentalsPage })),
);
const RentalDetailsPage = lazy(() =>
  import('./pages/RentalDetailsPage').then((module) => ({ default: module.RentalDetailsPage })),
);
const MyPaymentsPage = lazy(() =>
  import('../payments/pages/MyPaymentsPage').then((module) => ({ default: module.MyPaymentsPage })),
);
const customer: Role[] = ['Customer'];
const load = (page: React.ReactNode) => (
  <RequireRole roles={customer}>
    <Suspense fallback={<LoadingState label="Loading rental information" />}>{page}</Suspense>
  </RequireRole>
);

export const rentalRoutes = [
  { path: '/rentals', element: load(<MyRentalsPage />) },
  { path: '/rentals/:contractId', element: load(<RentalDetailsPage />) },
  { path: '/payments', element: load(<MyPaymentsPage />) },
];
