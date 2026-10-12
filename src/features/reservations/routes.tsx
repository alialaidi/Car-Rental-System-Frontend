import { lazy, Suspense } from 'react';
import { RequireRole } from '../auth/guards/RequireRole';
import type { Role } from '../auth/model/session';
import { LoadingState } from '../../shared/ui';

const NewReservationPage = lazy(() =>
  import('./pages/NewReservationPage').then((module) => ({ default: module.NewReservationPage })),
);
const MyReservationsPage = lazy(() =>
  import('./pages/MyReservationsPage').then((module) => ({ default: module.MyReservationsPage })),
);
const ReservationDetailsPage = lazy(() =>
  import('./pages/ReservationDetailsPage').then((module) => ({
    default: module.ReservationDetailsPage,
  })),
);
const customer: Role[] = ['Customer'];
const load = (page: React.ReactNode) => (
  <RequireRole roles={customer}>
    <Suspense fallback={<LoadingState label="Loading reservation" />}>{page}</Suspense>
  </RequireRole>
);

export const reservationRoutes = [
  { path: '/reservations/new', element: load(<NewReservationPage />) },
  { path: '/reservations', element: load(<MyReservationsPage />) },
  { path: '/reservations/:reservationId', element: load(<ReservationDetailsPage />) },
];
