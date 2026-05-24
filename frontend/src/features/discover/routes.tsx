import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.TASTE_MATCH,
    Component: lazy(() => import('./pages/TasteMatchPage')),
    layout: 'app',
    meta: {
      screenId: '16-taste-match',
      title: 'Taste Match · 취향 매칭',
      phase: 'MVP+',
      apiIds: ['TM-01'],
    },
  },
];
