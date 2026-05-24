import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.WHISKEY_DETAIL,
    Component: lazy(() => import('./pages/WhiskeyDetailPage')),
    layout: 'app',
    meta: {
      screenId: '09-detail',
      title: 'Whiskey Detail · 상세',
      phase: 'MVP',
      apiIds: ['WH-02', 'WH-02-1', 'TAG-01'],
    },
  },
  {
    path: PATHS.WHISKEY_REVIEWS,
    Component: lazy(() => import('./pages/WhiskeyReviewsPage')),
    layout: 'app',
    meta: {
      screenId: '10-detail-reviews',
      title: 'Whiskey Reviews · 리뷰',
      phase: 'MVP',
      apiIds: ['REV-01'],
    },
  },
];
