import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.LANDING,
    Component: lazy(() => import('./pages/LandingPage')),
    layout: 'guest',
    meta: {
      screenId: '01-landing',
      title: 'Landing · 랜딩',
      phase: 'MVP',
      apiIds: [],
    },
  },
];
