import { lazy } from 'react';
import { PATHS } from '@/app/router/paths';
import type { FeatureRoute } from '@/app/router/types';

export const routes: FeatureRoute[] = [
  {
    path: PATHS.WRITE_REVIEW,
    Component: lazy(() => import('./pages/WriteReviewPage')),
    layout: 'app',
    meta: {
      screenId: '11-write-review',
      title: 'Write Review',
      phase: 'MVP',
      apiIds: ['REV-02'],
    },
  },
  {
    path: PATHS.REVIEW_PICK,
    Component: lazy(() => import('./pages/ReviewPickPage')),
    layout: 'app',
    meta: {
      screenId: '11-review-pick',
      title: 'Review Pick',
      phase: 'MVP',
      apiIds: [],
    },
  },
];
