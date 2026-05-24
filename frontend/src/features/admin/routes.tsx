import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.ADMIN,
    Component: lazy(() => import('./pages/AdminPage')),
    layout: 'app',
    meta: {
      screenId: 'admin',
      title: 'Admin · 운영',
      phase: 'P2',
      apiIds: ['ADM-01'],
    },
  },
];
