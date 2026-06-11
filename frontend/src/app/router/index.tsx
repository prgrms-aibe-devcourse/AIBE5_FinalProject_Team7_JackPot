import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/shared/components/layout/AppShell';
import { GuestLayout } from '@/shared/components/layout/GuestLayout';
import { PageLoader } from '@/shared/components/ui/PageLoader';
import { ChunkErrorBoundary } from '@/shared/components/error/ChunkErrorBoundary';
import { collectFeatureRoutes } from './collectFeatureRoutes';
import { PATHS } from './paths';

const NotFoundPage      = lazy(() => import('@/shared/components/error/NotFoundPage'));
const ServerErrorPage   = lazy(() => import('@/shared/components/error/ServerErrorPage'));
const UnauthorizedPage  = lazy(() => import('@/shared/components/error/UnauthorizedPage'));
const ForbiddenPage     = lazy(() => import('@/shared/components/error/ForbiddenPage'));
const BannedUserPage    = lazy(() => import('@/shared/components/error/BannedUserPage'));

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
    errorElement: <ChunkErrorBoundary />,
    children: guestChildren,
  },
  {
    element: <AppShell />,
    errorElement: <ChunkErrorBoundary />,
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
  {
    path: PATHS.UNAUTHORIZED,
    element: (
      <Suspense fallback={<PageLoader label="오류 페이지" />}>
        <UnauthorizedPage />
      </Suspense>
    ),
  },
  {
    path: PATHS.FORBIDDEN,
    element: (
      <Suspense fallback={<PageLoader label="오류 페이지" />}>
        <ForbiddenPage />
      </Suspense>
    ),
  },
  {
    path: PATHS.BANNED_USER,
    element: (
      <Suspense fallback={<PageLoader label="오류 페이지" />}>
        <BannedUserPage />
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
