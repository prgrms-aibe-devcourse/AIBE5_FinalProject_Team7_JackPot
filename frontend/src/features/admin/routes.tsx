import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.ADMIN,
    Component: lazy(() => import('./pages/AdminPage')),
    layout: 'app',
    meta: { screenId: 'admin', title: 'Admin · 운영', phase: 'P2', apiIds: ['ADM-01'] },
  },
  {
    path: PATHS.WHISKEY_REQUEST,
    Component: lazy(() => import('./pages/WhiskeyRequestListPage')),
    layout: 'app',
    meta: { screenId: 'whiskey-request-list', title: '위스키 등록 요청', phase: 'MVP', apiIds: ['WH-02'] },
  },
  {
    path: PATHS.WHISKEY_REQUEST_DETAIL,
    Component: lazy(() => import('./pages/WhiskeyRequestDetailPage')),
    layout: 'app',
    meta: { screenId: 'whiskey-request-detail', title: '위스키 등록 요청 상세', phase: 'MVP', apiIds: ['WH-03'] },
  },
];
