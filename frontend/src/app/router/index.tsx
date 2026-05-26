import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/shared/components/layout/AppShell';
import { GuestLayout } from '@/shared/components/layout/GuestLayout';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { collectFeatureRoutes } from './collectFeatureRoutes';
import { PATHS } from './paths';

const NotFoundPage    = lazy(() => import('@/shared/components/error/NotFoundPage'));
const ServerErrorPage = lazy(() => import('@/shared/components/error/ServerErrorPage'));

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
  // 에러 페이지 (레이아웃 없이 단독 렌더링)
  {
    path: PATHS.NOT_FOUND,
    element: (
      <Suspense fallback={<PageLoader label="오류 페이지" />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
  {
    path: PATHS.SERVER_ERROR,
    element: (
      <Suspense fallback={<PageLoader label="오류 페이지" />}>
        <ServerErrorPage />
      </Suspense>
    ),
  },
  // 등록되지 않은 경로 → 404
  { path: '*', element: (
      <Suspense fallback={<PageLoader label="오류 페이지" />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
