import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.RECOMMEND,
    Component: lazy(() => import('./pages/RecommendationPage')),
    layout: 'guest',
    meta: {
      screenId: '05-recommendation',
      title: 'Recommendation · 추천',
      phase: 'MVP',
      apiIds: ['REC-01', 'REC-02'],
    },
  },
];
