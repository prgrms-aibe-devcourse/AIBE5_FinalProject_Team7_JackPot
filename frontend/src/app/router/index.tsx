import { Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/shared/components/layout/AppShell';
import { GuestLayout } from '@/shared/components/layout/GuestLayout';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { collectFeatureRoutes } from './collectFeatureRoutes';
import { PATHS } from './paths';

const featureRoutes = collectFeatureRoutes();

const guestChildren = featureRoutes
  .filter((route) => route.layout === 'guest')
  .map(({ path, Component, meta }) => ({
    path,
    element: (
      <Suspense fallback={<PageLoader label={meta.title} />}>
        <Component />
      </Suspense>
    ),
  }));

const appChildren = featureRoutes
  .filter((route) => route.layout === 'app')
  .map(({ path, Component, meta }) => ({
    path,
    element: (
      <Suspense fallback={<PageLoader label={meta.title} />}>
        <Component />
      </Suspense>
    ),
  }));

const router = createBrowserRouter([
  {
    element: <GuestLayout />,
    children: guestChildren,
  },
  {
    element: <AppShell />,
    children: appChildren,
  },
  { path: '*', element: <Navigate to={PATHS.LANDING} replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
