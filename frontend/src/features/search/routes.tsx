import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.SEARCH,
    Component: lazy(() => import('./pages/SearchPage')),
    layout: 'app',
    meta: {
      screenId: '07-search',
      title: 'Search · 검색',
      phase: 'MVP',
      apiIds: ['WH-01'],
    },
  },
];
