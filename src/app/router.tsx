import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '../features/auth/guards/RequireAuth';
import { RequireRole } from '../features/auth/guards/RequireRole';
import { LoadingState } from '../shared/ui';
import { AppLayout } from './layouts/AppLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { navigationItems } from './navigation';
import { LandingRedirect } from './LandingRedirect';
import { catalogRoutes } from '../features/catalog/routes';
import { reservationRoutes } from '../features/reservations/routes';
import { rentalRoutes } from '../features/rentals/routes';

const LoginPage = lazy(() =>
  import('../features/auth/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('../features/auth/pages/RegisterPage').then((module) => ({
    default: module.RegisterPage,
  })),
);
const RoutePlaceholderPage = lazy(() =>
  import('./RoutePages').then((module) => ({ default: module.RoutePlaceholderPage })),
);
const ForbiddenPage = lazy(() =>
  import('./RoutePages').then((module) => ({ default: module.ForbiddenPage })),
);
const NotFoundPage = lazy(() =>
  import('./RoutePages').then((module) => ({ default: module.NotFoundPage })),
);

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<LoadingState label="Loading page" />}>{node}</Suspense>;
}

export const appRoutes = [
  {
    element: <PublicLayout />,
    children: [
      { path: '/login', element: withSuspense(<LoginPage />) },
      { path: '/register', element: withSuspense(<RegisterPage />) },
    ],
  },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/', element: <LandingRedirect /> },
      ...catalogRoutes,
      ...reservationRoutes,
      ...rentalRoutes,
      ...navigationItems
        .filter(
          (item) => !['/vehicles', '/reservations', '/rentals', '/payments'].includes(item.path),
        )
        .map((item) => ({
          path: item.path,
          element: (
            <RequireRole roles={item.roles}>
              {withSuspense(<RoutePlaceholderPage title={item.label} />)}
            </RequireRole>
          ),
        })),
      { path: '/403', element: withSuspense(<ForbiddenPage />) },
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
];

export const router = createBrowserRouter(appRoutes);
