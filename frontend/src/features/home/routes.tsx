import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.LOUNGE,
    Component: lazy(() => import('./pages/HomePage')),
    layout: 'app',
    meta: {
      screenId: '06-home',
      title: '라운지 · 타임라인',
      phase: 'MVP',
      apiIds: ['FEED-01', 'REC-03'],
    },
  },
];
